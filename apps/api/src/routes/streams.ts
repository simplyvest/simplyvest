import { Hono } from "hono";

import type { Env } from "../../env";

import { createDb } from "../db";
import { createStreamService } from "../services/stream-service";

export const streamRoutes = new Hono<{ Bindings: Env }>();

streamRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createStreamService(db);

  const required = [
    "id",
    "type",
    "creatorAddress",
    "recipientAddress",
    "mintAddress",
    "vaultAddress",
    "amount",
    "creationTx",
    "createdAt",
  ];
  for (const field of required) {
    if (!body[field]) {
      return c.json({ error: `Missing required field: ${field}` }, 400);
    }
  }

  const stream = await service.createStream({
    id: body.id,
    type: body.type,
    creatorAddress: body.creatorAddress,
    recipientAddress: body.recipientAddress,
    mintAddress: body.mintAddress,
    vaultAddress: body.vaultAddress,
    amount: body.amount,
    orgId: body.orgId,
    startTime: body.startTime,
    endTime: body.endTime,
    cliffTime: body.cliffTime,
    milestoneAuthority: body.milestoneAuthority,
    creationTx: body.creationTx,
    createdAt: body.createdAt,
  });

  if (!stream) {
    return c.json({ error: "Stream already exists" }, 409);
  }

  return c.json(stream, 201);
});

streamRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const service = createStreamService(db);

  const statusParam = c.req.query("status");
  const typeParam = c.req.query("type");

  const validStatuses: Record<string, boolean> = {
    active: true,
    completed: true,
    cancelled: true,
    orphaned: true,
  };
  const validTypes: Record<string, boolean> = {
    time: true,
    milestone: true,
  };

  const filters = {
    creatorAddress: c.req.query("creator") ?? undefined,
    recipientAddress: c.req.query("recipient") ?? undefined,
    orgId: c.req.query("org") ?? undefined,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    status:
      statusParam && validStatuses[statusParam]
        ? (statusParam as "active" | "completed" | "cancelled" | "orphaned")
        : undefined,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    type: typeParam && validTypes[typeParam] ? (typeParam as "time" | "milestone") : undefined,
  };

  const result = await service.listStreams(filters);
  return c.json(result);
});

streamRoutes.get("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const service = createStreamService(db);

  const stream = await service.getStreamWithEvents(c.req.param("id"));
  if (!stream) {
    return c.json({ error: "Stream not found" }, 404);
  }

  return c.json(stream);
});

streamRoutes.post("/:id/sync", async (c) => {
  const db = createDb(c.env.DB);
  const service = createStreamService(db);
  const streamId = c.req.param("id");
  const rpcUrl = c.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

  const stream = await service.getStreamById(streamId);
  if (!stream) {
    return c.json({ error: "Stream not found" }, 404);
  }

  const synced = await service.syncStream(streamId, rpcUrl);
  return c.json(synced);
});

streamRoutes.post("/:id/events", async (c) => {
  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createStreamService(db);
  const streamId = c.req.param("id");

  const required = ["eventType", "actorAddress", "txSignature", "blockTime"];
  for (const field of required) {
    if (!body[field]) {
      return c.json({ error: `Missing required field: ${field}` }, 400);
    }
  }

  const stream = await service.getStreamById(streamId);
  if (!stream) {
    return c.json({ error: "Stream not found" }, 404);
  }

  const event = await service.createEvent({
    streamId,
    eventType: body.eventType,
    actorAddress: body.actorAddress,
    amount: body.amount,
    txSignature: body.txSignature,
    blockTime: body.blockTime,
  });

  if (body.eventType === "completed" || body.eventType === "cancelled") {
    await service.updateStreamStatus(
      streamId,
      body.eventType === "completed" ? "completed" : "cancelled",
      body.txSignature,
    );
  } else if (body.eventType === "withdrawn" && body.amount) {
    const current = await service.getStreamById(streamId);
    if (current) {
      const prev = BigInt(current.amountWithdrawn ?? "0");
      const withdrawn = BigInt(body.amount);
      await service.updateStreamAmountWithdrawn(streamId, (prev + withdrawn).toString());
    }
  } else if (body.eventType === "milestone_triggered") {
    await service.updateMilestoneReached(streamId);
  }

  return c.json(event, 201);
});
