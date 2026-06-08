import { eq, and, desc, type SQL } from "drizzle-orm";

import type { Db } from "../db";

import { streams, streamEvents } from "../db/schema";

export interface CreateStreamInput {
  id: string;
  type: "time" | "milestone";
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
}

export interface CreateEventInput {
  streamId: string;
  eventType: "created" | "withdrawn" | "milestone_triggered" | "completed" | "cancelled";
  actorAddress: string;
  amount?: string;
  txSignature: string;
  blockTime: number;
}

export interface StreamFilters {
  creatorAddress?: string;
  recipientAddress?: string;
  orgId?: string;
  status?: "active" | "completed" | "cancelled" | "orphaned";
  type?: "time" | "milestone";
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

    async updateStreamStatus(
      streamId: string,
      status: "active" | "completed" | "cancelled" | "orphaned",
      closeTx?: string,
    ) {
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
