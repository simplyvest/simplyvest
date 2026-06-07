import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").unique().notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const orgMembers = sqliteTable("org_members", {
  orgId: text("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "member"] }).notNull(),
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const streams = sqliteTable(
  "streams",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["time", "milestone"] }).notNull(),
    creatorAddress: text("creator_address").notNull(),
    recipientAddress: text("recipient_address").notNull(),
    mintAddress: text("mint_address").notNull(),
    vaultAddress: text("vault_address").notNull(),
    amount: text("amount").notNull(),
    orgId: text("org_id"),

    startTime: integer("start_time", { mode: "number" }),
    endTime: integer("end_time", { mode: "number" }),
    cliffTime: integer("cliff_time", { mode: "number" }),

    milestoneAuthority: text("milestone_authority"),
    milestoneReached: integer("milestone_reached", { mode: "boolean" }).default(false),

    status: text("status", { enum: ["active", "completed", "cancelled", "orphaned"] })
      .notNull()
      .default("active"),
    amountWithdrawn: text("amount_withdrawn").default("0"),

    creationTx: text("creation_tx").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
    closedAt: integer("closed_at", { mode: "number" }),
    closeTx: text("close_tx"),

    lastSyncedAt: integer("last_synced_at", { mode: "number" }),
    syncVersion: integer("sync_version", { mode: "number" }).default(0),
  },
  (t) => [
    index("idx_streams_creator").on(t.creatorAddress),
    index("idx_streams_recipient").on(t.recipientAddress),
    index("idx_streams_org").on(t.orgId),
    index("idx_streams_status").on(t.status),
  ],
);

export const streamEvents = sqliteTable(
  "stream_events",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    streamId: text("stream_id")
      .notNull()
      .references(() => streams.id),
    eventType: text("event_type", {
      enum: ["created", "withdrawn", "milestone_triggered", "completed", "cancelled"],
    }).notNull(),
    actorAddress: text("actor_address").notNull(),
    amount: text("amount"),
    txSignature: text("tx_signature").notNull(),
    blockTime: integer("block_time", { mode: "number" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("idx_events_stream").on(t.streamId),
    index("idx_events_type").on(t.eventType),
    uniqueIndex("idx_events_dedup").on(t.streamId, t.eventType, t.txSignature),
  ],
);
