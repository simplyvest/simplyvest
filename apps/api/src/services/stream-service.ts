import { eq, and, desc, type SQL } from "drizzle-orm";

import type { Db } from "../db";

import { streams, streamEvents } from "../db/schema";

export type StreamStatus = "active" | "completed" | "cancelled" | "orphaned";
export type StreamType = "time" | "milestone";
export type EventType = "created" | "withdrawn" | "milestone_triggered" | "completed" | "cancelled";

export interface CreateStreamInput {
  id: string;
  type: StreamType;
  creatorAddress: string;
  recipientAddress: string;
  mintAddress: string;
  vaultAddress: string;
  amount: string;
  orgId?: string;
  startTime?: number;
  endTime?: number;
  cliffTime?: number;
  milestoneAuthority?: string;
  creationTx: string;
  createdAt: number;
  // New metadata fields
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  creatorDisplayName?: string;
  description?: string;
}

export interface CreateEventInput {
  streamId: string;
  eventType: EventType;
  actorAddress: string;
  amount?: string;
  txSignature: string;
  blockTime: number;
}

export interface StreamFilters {
  creatorAddress?: string;
  recipientAddress?: string;
  orgId?: string;
  status?: StreamStatus;
  type?: StreamType;
}

export function createStreamService(db: Db) {
  return {
    async createStream(input: CreateStreamInput) {
      const result = await db
        .insert(streams)
        .values({
          id: input.id,
          type: input.type,
          creatorAddress: input.creatorAddress,
          recipientAddress: input.recipientAddress,
          mintAddress: input.mintAddress,
          vaultAddress: input.vaultAddress,
          amount: input.amount,
          orgId: input.orgId ?? null,
          startTime: input.startTime ?? null,
          endTime: input.endTime ?? null,
          cliffTime: input.cliffTime ?? null,
          milestoneAuthority: input.milestoneAuthority ?? null,
          creationTx: input.creationTx,
          createdAt: input.createdAt,
          // New metadata fields
          tokenName: input.tokenName ?? null,
          tokenSymbol: input.tokenSymbol ?? null,
          tokenDecimals: input.tokenDecimals ?? null,
          creatorDisplayName: input.creatorDisplayName ?? null,
          description: input.description ?? null,
        })
        .onConflictDoNothing()
        .returning();

      return result[0] ?? null;
    },

    async createEvent(input: CreateEventInput) {
      const result = await db
        .insert(streamEvents)
        .values({
          streamId: input.streamId,
          eventType: input.eventType,
          actorAddress: input.actorAddress,
          amount: input.amount ?? null,
          txSignature: input.txSignature,
          blockTime: input.blockTime,
        })
        .returning();

      return result[0];
    },

    async updateStreamStatus(streamId: string, status: StreamStatus, closeTx?: string) {
      await db
        .update(streams)
        .set({
          status,
          closedAt: status !== "active" ? Math.floor(Date.now() / 1000) : null,
          closeTx: closeTx ?? null,
        })
        .where(eq(streams.id, streamId));
    },

    async updateStreamAmountWithdrawn(streamId: string, amountWithdrawn: string) {
      await db.update(streams).set({ amountWithdrawn }).where(eq(streams.id, streamId));
    },

    async updateMilestoneReached(streamId: string) {
      await db.update(streams).set({ milestoneReached: true }).where(eq(streams.id, streamId));
    },

    async syncStream(streamId: string, rpcUrl?: string) {
      const stream = await this.getStreamById(streamId);
      if (!stream) return null;

      const now = Math.floor(Date.now() / 1000);

      // Skip if synced within 60 seconds
      if (stream.lastSyncedAt && now - stream.lastSyncedAt < 60) {
        return stream;
      }

      // If no RPC URL, just update timestamp
      if (!rpcUrl) {
        await db.update(streams).set({ lastSyncedAt: now }).where(eq(streams.id, streamId));
        return this.getStreamById(streamId);
      }

      // Fetch on-chain state
      try {
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getAccountInfo",
            params: [streamId, { commitment: "confirmed" }],
          }),
        });

        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const data = (await response.json()) as { result?: { value: unknown } };
        const accountExists = data.result?.value != null;

        if (!accountExists && stream.status === "active") {
          // Account closed - mark as completed
          await db
            .update(streams)
            .set({
              status: "completed",
              lastSyncedAt: now,
              closedAt: now,
            })
            .where(eq(streams.id, streamId));
        } else if (accountExists) {
          // Account exists - decode and update state
          // For now, just update sync time
          // TODO: Decode account data to get amountWithdrawn, milestoneReached
          await db.update(streams).set({ lastSyncedAt: now }).where(eq(streams.id, streamId));
        } else {
          // Just update sync time
          await db.update(streams).set({ lastSyncedAt: now }).where(eq(streams.id, streamId));
        }
      } catch {
        // On error, still update sync time to avoid hammering
        await db.update(streams).set({ lastSyncedAt: now }).where(eq(streams.id, streamId));
      }

      return this.getStreamById(streamId);
    },

    async getStreamById(streamId: string) {
      const result = await db.select().from(streams).where(eq(streams.id, streamId)).limit(1);
      return result[0] ?? null;
    },

    async getStreamWithEvents(streamId: string) {
      const stream = await this.getStreamById(streamId);
      if (!stream) return null;

      const events = await db
        .select()
        .from(streamEvents)
        .where(eq(streamEvents.streamId, streamId))
        .orderBy(desc(streamEvents.blockTime));

      return { ...stream, events };
    },

    async listStreams(filters: StreamFilters) {
      const conditions: SQL[] = [];
      if (filters.creatorAddress)
        conditions.push(eq(streams.creatorAddress, filters.creatorAddress));
      if (filters.recipientAddress)
        conditions.push(eq(streams.recipientAddress, filters.recipientAddress));
      if (filters.orgId) conditions.push(eq(streams.orgId, filters.orgId));
      if (filters.status) conditions.push(eq(streams.status, filters.status));
      if (filters.type) conditions.push(eq(streams.type, filters.type));

      const query =
        conditions.length > 0
          ? db
              .select()
              .from(streams)
              .where(and(...conditions))
          : db.select().from(streams);

      return query.orderBy(desc(streams.createdAt));
    },
  };
}

export type StreamService = ReturnType<typeof createStreamService>;
