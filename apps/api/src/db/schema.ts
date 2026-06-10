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
    creatorDisplayName: text("creator_display_name"),
    description: text("description"),

    status: text("status", { enum: ["active", "completed", "cancelled", "orphaned"] })
      .notNull()
      .default("active"),
    amountWithdrawn: text("amount_withdrawn").default("0"),
    tokenName: text("token_name"),
    tokenSymbol: text("token_symbol"),
    tokenDecimals: integer("token_decimals"),

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

export const tokenCreations = sqliteTable(
  "token_creations",
  {
    mintAddress: text("mint_address").primaryKey(),
    creatorAddress: text("creator_address").notNull(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    decimals: integer("decimals").notNull(),
    supply: text("supply").notNull(),
    metadataUri: text("metadata_uri").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [index("idx_token_creations_creator").on(t.creatorAddress)],
);

export const tokenPreferences = sqliteTable(
  "token_preferences",
  {
    mintAddress: text("mint_address").notNull(),
    creatorAddress: text("creator_address").notNull(),
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    hiddenAt: text("hidden_at"),
  },
  (t) => [uniqueIndex("idx_token_prefs_unique").on(t.mintAddress, t.creatorAddress)],
);

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id").primaryKey(),
  tokenVisibilityMode: text("token_visibility_mode", { enum: ["hide_list", "allow_list"] })
    .notNull()
    .default("hide_list"),
});
