import { Hono } from "hono";

import type { Env } from "../env";

import { createDb } from "./db";
import { cors } from "./middleware/cors";
import { rateLimit } from "./middleware/rate-limit";
import { orgRoutes } from "./routes/organizations";
import { reconcileRoutes } from "./routes/reconciliation";
import { streamRoutes } from "./routes/streams";
import { userRoutes } from "./routes/users";
import { waitlistRoutes } from "./routes/waitlist";
import { createReconcilerService } from "./services/reconciler";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors);

// Rate limit write endpoints: 30 requests per minute per IP
app.use("/api/streams", rateLimit({ windowMs: 60_000, max: 30 }));
app.use("/api/streams/*/events", rateLimit({ windowMs: 60_000, max: 30 }));
app.use("/api/users/*", rateLimit({ windowMs: 60_000, max: 20 }));
app.use("/api/orgs", rateLimit({ windowMs: 60_000, max: 10 }));
app.use("/api/orgs/*/members", rateLimit({ windowMs: 60_000, max: 20 }));
app.use("/api/waitlist", rateLimit({ windowMs: 60_000, max: 5 }));

app.route("/api/waitlist", waitlistRoutes);
app.route("/api/streams", streamRoutes);
app.route("/api/users", userRoutes);
app.route("/api/orgs", orgRoutes);
app.route("/api/reconcile", reconcileRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env) {
    const db = createDb(env.DB);
    const rpcUrl = env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile(100);
    console.log("[Reconcile]", JSON.stringify(result));
  },
};
