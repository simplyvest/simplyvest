import { Hono } from "hono";

import type { Env } from "../../env";
import { createDb } from "../db";
import { createStreamService } from "../services/stream-service";

export const streamRoutes = new Hono<{ Bindings: Env }>();

streamRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createStreamService(db);

  const required = ["id", "type", "creatorAddress", "recipientAddress", "mintAddress", "vaultAddress", "amount", "creationTx", "createdAt"];
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

  const filters = {
    creatorAddress: c.req.query("creator") ?? undefined,
    recipientAddress: c.req.query("recipient") ?? undefined,
    orgId: c.req.query("org") ?? undefined,
    status: c.req.query("status") ?? undefined,
    type: c.req.query("type") ?? undefined,
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
    await service.updateStreamStatus(streamId, body.eventType, body.txSignature);
  }

  return c.json(event, 201);
});
