import { Hono } from "hono";

import type { Env } from "../env";
import { cors } from "./middleware/cors";
import { waitlistRoutes } from "./routes/waitlist";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors);

app.route("/api/waitlist", waitlistRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
