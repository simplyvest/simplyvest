import {
  decodeStreamAccount,
  decodeMilestoneStreamAccount,
  fetchAccountInfo,
} from "@solana-tdp/sdk";
import { eq, and, sql } from "drizzle-orm";

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
              // Account exists — decode on-chain state and sync fields
              let amountWithdrawn: string | undefined;
              let milestoneReached: boolean | undefined;

              try {
                const raw = Buffer.from(accountInfo.data, "base64");
                if (stream.type === "milestone") {
                  const decoded = decodeMilestoneStreamAccount(raw);
                  amountWithdrawn = decoded.amountWithdrawn.toString();
                  milestoneReached = decoded.milestoneReached;
                } else {
                  const decoded = decodeStreamAccount(raw);
                  amountWithdrawn = decoded.amountWithdrawn.toString();
                }
              } catch {
                // If decoding fails, just fall through and update sync time
              }

              // oxlint-disable-next-line no-await-in-loop
              await db
                .update(streams)
                .set({
                  lastSyncedAt: Math.floor(Date.now() / 1000),
                  ...(amountWithdrawn !== undefined ? { amountWithdrawn } : {}),
                  ...(milestoneReached !== undefined ? { milestoneReached } : {}),
                })
                .where(eq(streams.id, stream.id));

              result.updated++;
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
