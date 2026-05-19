import { getAccessToken, appendToSheet } from "./google-auth";
import type { Env } from "../env";

interface WaitlistPayload {
  name: string;
  email: string;
  telegram: string;
  following: string;
  interview: boolean;
}

function json(data: unknown, status = 200, origin = ""): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return new Response(JSON.stringify(data), { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }

    let body: WaitlistPayload;
    try {
      body = (await request.json()) as WaitlistPayload;
    } catch {
      return json({ error: "Invalid JSON body" }, 400, origin);
    }

    if (!body.name || !body.email || !body.telegram) {
      return json(
        { error: "name, email, and telegram are required" },
        400,
        origin,
      );
    }

    try {
      const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
      const token = await getAccessToken(
        env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey,
      );

      await appendToSheet(
        token,
        env.GOOGLE_SHEET_ID,
        env.GOOGLE_SHEET_NAME ?? "Sheet1",
        [
          body.name,
          body.email,
          body.telegram,
          body.following || "",
          body.interview ? "Yes" : "No",
          new Date().toISOString(),
        ],
      );

      return json({ ok: true }, 200, origin);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return json({ error: message }, 500, origin);
    }
  },
};
