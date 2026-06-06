import { Hono } from "hono";

import type { Env } from "../env";
import { cors } from "./middleware/cors";
import { orgRoutes } from "./routes/organizations";
import { reconcileRoutes } from "./routes/reconciliation";
import { streamRoutes } from "./routes/streams";
import { userRoutes } from "./routes/users";
import { waitlistRoutes } from "./routes/waitlist";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors);

app.route("/api/waitlist", waitlistRoutes);
app.route("/api/streams", streamRoutes);
app.route("/api/users", userRoutes);
app.route("/api/orgs", orgRoutes);
app.route("/api/reconcile", reconcileRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
