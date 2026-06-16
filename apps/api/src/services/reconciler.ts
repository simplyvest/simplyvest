import { eq, and, sql } from "drizzle-orm";

import type { Db } from "../db";

import { streams, streamEvents } from "../db/schema";

interface ReconcileResult {
  processed: number;
  updated: number;
  errors: string[];
}

type AccountInfoResult =
  | { status: "exists" }
  | { status: "not_found" }
  | { status: "error"; error: string };

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
          .where(eq(streams.status, "active"))
          .limit(limit);

        result.processed = activeStreams.length;

        // oxlint-disable-next-line no-await-in-loop
        for (const stream of activeStreams) {
          try {
            // Check if the on-chain account still exists
            // oxlint-disable-next-line no-await-in-loop
            const accountInfo = await fetchAccountInfo(rpcUrl, stream.id);

            if (accountInfo.status === "error") {
              result.errors.push(`Stream ${stream.id}: RPC error — ${accountInfo.error}`);
            } else if (accountInfo.status === "not_found") {
              // Account closed on-chain — mark as completed
              // oxlint-disable-next-line no-await-in-loop
              await db
                .update(streams)
                .set({
                  status: "completed",
                  closedAt: Math.floor(Date.now() / 1000),
                  lastSyncedAt: Math.floor(Date.now() / 1000),
                })
                .where(eq(streams.id, stream.id));

              // Add a completed event if not already present
              // oxlint-disable-next-line no-await-in-loop
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
                // oxlint-disable-next-line no-await-in-loop
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
              // oxlint-disable-next-line no-await-in-loop
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
      const [activeResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(streams)
        .where(eq(streams.status, "active"));
      const [completedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(streams)
        .where(eq(streams.status, "completed"));
      const [cancelledResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(streams)
        .where(eq(streams.status, "cancelled"));
      const [orphanedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(streams)
        .where(eq(streams.status, "orphaned"));
      const [eventsResult] = await db.select({ count: sql<number>`count(*)` }).from(streamEvents);

      return {
        streams: {
          total:
            activeResult.count +
            completedResult.count +
            cancelledResult.count +
            orphanedResult.count,
          active: activeResult.count,
          completed: completedResult.count,
          cancelled: cancelledResult.count,
          orphaned: orphanedResult.count,
        },
        events: { total: eventsResult.count },
      };
    },
  };
}

async function fetchAccountInfo(rpcUrl: string, address: string): Promise<AccountInfoResult> {
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

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const data = (await response.json()) as {
      result?: { value: unknown };
      error?: { message: string };
    };

    if (data.error) {
      return { status: "error", error: data.error.message };
    }

    // If value is null, account doesn't exist
    if (!data.result?.value) {
      return { status: "not_found" };
    }

    return { status: "exists" };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown RPC error",
    };
  }
}
