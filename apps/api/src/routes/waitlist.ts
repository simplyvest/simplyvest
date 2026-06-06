import { Hono } from "hono";

import type { Env } from "../../env";
import { getAccessToken, appendToSheet } from "../google-auth";
import { isRecord } from "../utils";

export const waitlistRoutes = new Hono<{ Bindings: Env }>();

waitlistRoutes.post("/", async (c) => {
  let body: { name: string; email: string; telegram: string; following: string; interview: boolean };
  try {
    const raw = await c.req.json();
    if (!isRecord(raw)) {
      return c.json({ error: "Invalid JSON body" }, 400);
    }
    body = {
      name: typeof raw.name === "string" ? raw.name : "",
      email: typeof raw.email === "string" ? raw.email : "",
      telegram: typeof raw.telegram === "string" ? raw.telegram : "",
      following: typeof raw.following === "string" ? raw.following : "",
      interview: typeof raw.interview === "boolean" ? raw.interview : false,
    };
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.name || !body.email || !body.telegram) {
    return c.json({ error: "name, email, and telegram are required" }, 400);
  }

  try {
    const privateKey = c.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
    const token = await getAccessToken(c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, privateKey);

    await appendToSheet(token, c.env.GOOGLE_SHEET_ID, c.env.GOOGLE_SHEET_NAME ?? "Sheet1", [
      body.name,
      body.email,
      body.telegram,
      body.following || "",
      body.interview ? "Yes" : "No",
      new Date().toISOString(),
    ]);

    return c.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});
