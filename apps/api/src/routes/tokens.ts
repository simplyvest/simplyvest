import { Hono } from "hono";

import type { Env } from "../../env";

import { createDb } from "../db";
import {
  createTokenService,
  createPlatformToken,
  uploadMetadataJson,
} from "../services/token-service";

const IMAGE_MAX_SIZE = 2_097_152; // 2MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export const tokenRoutes = new Hono<{ Bindings: Env }>();

// Serve R2 files publicly via /r2/*
tokenRoutes.get("/r2/*", async (c) => {
  const key = c.req.path.replace("/api/tokens/r2/", "");
  if (!key) return c.json({ error: "Not found" }, 404);

  const obj = await c.env.TOKEN_ASSETS.get(key);
  if (!obj) return c.json({ error: "Not found" }, 404);

  obj.writeHttpMetadata(c.res.headers);
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  return c.body(obj.body);
});

tokenRoutes.post("/upload-image", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const form = await c.req.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return c.json({ error: "No file provided" }, 400);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const f = file as unknown as File;
  if (!ALLOWED_TYPES.has(f.type)) {
    return c.json({ error: "Unsupported file type. Allowed: PNG, JPEG, WebP, SVG" }, 400);
  }
  if (f.size > IMAGE_MAX_SIZE) {
    return c.json({ error: "File too large. Max 2MB" }, 400);
  }

  const ext = f.type === "image/svg+xml" ? "svg" : "webp";
  const key = `tokens/${crypto.randomUUID()}.${ext}`;

  const buffer = await f.arrayBuffer();
  await c.env.TOKEN_ASSETS.put(key, buffer, {
    httpMetadata: { contentType: f.type === "image/svg+xml" ? "image/svg+xml" : "image/webp" },
  });
  const url = new URL(`/api/tokens/r2/${key}`, c.req.url).toString();

  return c.json({ url });
});

tokenRoutes.post("/metadata", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{ name: string; symbol: string; imageUrl?: string }>();
  if (!body.name || !body.symbol) {
    return c.json({ error: "Missing required fields: name, symbol" }, 400);
  }

  const metadata: { name: string; symbol: string; image?: string } = {
    name: body.name,
    symbol: body.symbol,
  };
  if (body.imageUrl) {
    metadata.image = body.imageUrl;
  }

  const key = `tokens/${crypto.randomUUID()}.json`;
  await c.env.TOKEN_ASSETS.put(key, JSON.stringify(metadata), {
    httpMetadata: { contentType: "application/json" },
  });

  const uri = new URL(`/api/tokens/r2/${key}`, c.req.url).toString();

  return c.json({ uri });
});

tokenRoutes.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const service = createTokenService(db);

  const body = await c.req.json<{
    mintAddress: string;
    creatorAddress: string;
    name: string;
    symbol: string;
    decimals: number;
    supply: string;
    metadataUri: string;
  }>();

  const required = [
    "mintAddress",
    "creatorAddress",
    "name",
    "symbol",
    "decimals",
    "supply",
    "metadataUri",
  ] as const;
  for (const field of required) {
    if (!body[field]) {
      return c.json({ error: `Missing required field: ${field}` }, 400);
    }
  }

  const token = await service.recordToken(body);
  return c.json(token, 201);
});

tokenRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const service = createTokenService(db);

  const creator = c.req.query("creator");
  if (!creator) {
    return c.json({ error: "Missing required query param: creator" }, 400);
  }

  const filterParam = c.req.query("filter");
  const filter = filterParam === "visible" ? "visible" : undefined;
  const tokens = await service.listTokens(creator, filter);
  return c.json(tokens);
});

tokenRoutes.patch("/:mint/visibility", async (c) => {
  const db = createDb(c.env.DB);
  const service = createTokenService(db);

  const body = await c.req.json<{ visible: boolean; creatorAddress: string }>();
  if (typeof body.visible !== "boolean" || !body.creatorAddress) {
    return c.json({ error: "Missing required fields: visible, creatorAddress" }, 400);
  }

  await service.setVisibility({
    mintAddress: c.req.param("mint"),
    creatorAddress: body.creatorAddress,
    visible: body.visible,
  });

  return c.json({ ok: true });
});

tokenRoutes.get("/preferences", async (c) => {
  const db = createDb(c.env.DB);
  const service = createTokenService(db);

  const creator = c.req.query("creator");
  if (!creator) {
    return c.json({ error: "Missing required query param: creator" }, 400);
  }

  const prefs = await service.getPreferences(creator);
  return c.json(prefs);
});

tokenRoutes.post("/create-platform", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    name: string;
    symbol: string;
    decimals: number;
    amount: string;
    creatorAddress: string;
    imageUrl?: string;
  }>();

  const required = ["name", "symbol", "decimals", "amount", "creatorAddress"] as const;
  for (const field of required) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    if (!(body as Record<string, unknown>)[field]) {
      return c.json({ error: `Missing required field: ${field}` }, 400);
    }
  }

  const rpcUrl = c.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

  // Upload metadata if needed
  let metadataUri = "";
  if (body.imageUrl || body.name) {
    metadataUri = await uploadMetadataJson(
      body.name,
      body.symbol,
      body.imageUrl,
      c.env.TOKEN_ASSETS,
      c.req.url,
    );
  }

  try {
    const result = await createPlatformToken({
      secretKeyJson: c.env.PLATFORM_SECRET_KEY,
      rpcUrl,
      name: body.name,
      symbol: body.symbol,
      decimals: body.decimals,
      amount: body.amount,
      creatorAddress: body.creatorAddress,
      metadataUri,
    });

    const db = createDb(c.env.DB);
    const service = createTokenService(db);
    await service.recordToken({
      mintAddress: result.mintAddress,
      creatorAddress: body.creatorAddress,
      name: body.name,
      symbol: body.symbol,
      decimals: body.decimals,
      supply: result.supply,
      metadataUri,
    });

    return c.json(result, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});
