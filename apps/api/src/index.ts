import { Hono } from "hono";

import type { Env } from "../env";
import { cors } from "./middleware/cors";
import { streamRoutes } from "./routes/streams";
import { userRoutes } from "./routes/users";
import { waitlistRoutes } from "./routes/waitlist";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors);

app.route("/api/waitlist", waitlistRoutes);
app.route("/api/streams", streamRoutes);
app.route("/api/users", userRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
