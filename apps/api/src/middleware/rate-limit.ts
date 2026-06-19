import type { Context, Next } from "hono";

/**
 * Best-effort in-memory rate limiter for Cloudflare Workers.
 *
 * Limitations:
 * - State lives in a single Worker isolate. Cloudflare Workers do not
 *   guarantee request affinity, so concurrent requests from the same IP
 *   may hit different isolates — each with an independent counter.
 * - The check-and-increment is non-atomic: two concurrent requests can
 *   both see the entry as expired and each create a fresh entry at
 *   count 0, effectively doubling the allowed rate.
 *
 * For production hardening, migrate to Durable Objects (global
 * consistency) or KV with atomic checks.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60_000; // 1 minute

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

export function rateLimit(opts: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    cleanup();

    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    entry.count++;

    c.header("X-RateLimit-Limit", String(opts.max));
    c.header("X-RateLimit-Remaining", String(Math.max(0, opts.max - entry.count)));
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > opts.max) {
      return c.json({ error: "Too many requests" }, 429);
    }

    return next();
  };
}
