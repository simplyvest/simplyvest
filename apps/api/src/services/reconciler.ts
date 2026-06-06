import { eq, and, lt } from "drizzle-orm";

import type { Db } from "../db";
import { streams, streamEvents } from "../db/schema";

interface ReconcileResult {
  processed: number;
  updated: number;
  errors: string[];
}

export function createReconcilerService(db: Db, rpcUrl: string) {
  return {
    async reconcile(limit = 100): Promise<ReconcileResult> {
      const result: ReconcileResult = {
        processed: 0,
        updated: 0,
        errors: [],
      };

      try {
        // Get active streams that haven't been synced recently
        const activeStreams = await db
          .select()
          .from(streams)
          .where(eq(streams.status, "active"));

        result.processed = activeStreams.length;

        for (const stream of activeStreams) {
          try {
            // Check if the on-chain account still exists
            const accountInfo = await fetchAccountInfo(rpcUrl, stream.id);

            if (!accountInfo) {
              // Account closed on-chain — mark as completed
              await db
                .update(streams)
                .set({
                  status: "completed",
                  closedAt: Math.floor(Date.now() / 1000),
                  lastSyncedAt: Math.floor(Date.now() / 1000),
                })
                .where(eq(streams.id, stream.id));

              // Add a completed event if not already present
              const existingCompleted = await db
                .select()
                .from(streamEvents)
                .where(
                  and(
                    eq(streamEvents.streamId, stream.id),
                    eq(streamEvents.eventType, "completed"),
                  ),
                )
                .limit(1);

              if (existingCompleted.length === 0) {
                await db.insert(streamEvents).values({
                  streamId: stream.id,
                  eventType: "completed",
                  actorAddress: stream.creatorAddress,
                  txSignature: "reconciled",
                  blockTime: Math.floor(Date.now() / 1000),
                });
              }

              result.updated++;
            } else {
              // Account exists — update sync timestamp
              await db
                .update(streams)
                .set({
                  lastSyncedAt: Math.floor(Date.now() / 1000),
                })
                .where(eq(streams.id, stream.id));
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            result.errors.push(`Stream ${stream.id}: ${message}`);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        result.errors.push(`Reconciliation failed: ${message}`);
      }

      return result;
    },

    async getStats() {
      const allStreams = await db.select().from(streams);
      const active = allStreams.filter((s) => s.status === "active").length;
      const completed = allStreams.filter((s) => s.status === "completed").length;
      const cancelled = allStreams.filter((s) => s.status === "cancelled").length;
      const orphaned = allStreams.filter((s) => s.status === "orphaned").length;

      const totalEvents = await db.select().from(streamEvents);

      return {
        streams: { total: allStreams.length, active, completed, cancelled, orphaned },
        events: { total: totalEvents.length },
      };
    },
  };
}

async function fetchAccountInfo(
  rpcUrl: string,
  address: string,
): Promise<{ exists: boolean } | null> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [
          address,
          {
            encoding: "base64",
            commitment: "confirmed",
          },
        ],
      }),
    });

    const data = (await response.json()) as {
      result?: { value: unknown };
      error?: { message: string };
    };

    if (data.error) {
      throw new Error(data.error.message);
    }

    // If value is null, account doesn't exist
    if (!data.result?.value) {
      return null;
    }

    return { exists: true };
  } catch {
    return null;
  }
}
