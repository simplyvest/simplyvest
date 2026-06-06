import { Hono } from "hono";

import type { Env } from "../../env";
import { authMiddleware, getUserId } from "../middleware/auth";
import { createDb } from "../db";
import { createReconcilerService } from "../services/reconciler";

export const reconcileRoutes = new Hono<{ Bindings: Env }>();

// Trigger reconciliation (requires auth)
reconcileRoutes.post("/", authMiddleware, async (c) => {
  const db = createDb(c.env.DB);
  const rpcUrl = c.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const reconciler = createReconcilerService(db, rpcUrl);

  const result = await reconciler.reconcile(100);

  return c.json({
    ok: true,
    ...result,
  });
});

// Get reconciliation stats (requires auth)
reconcileRoutes.get("/stats", authMiddleware, async (c) => {
  const db = createDb(c.env.DB);
  const rpcUrl = c.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const reconciler = createReconcilerService(db, rpcUrl);

  const stats = await reconciler.getStats();

  return c.json(stats);
});
