# API-First Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor dashboard to fetch streams from API (DB) instead of on-chain, with on-demand sync for active streams.

**Architecture:** API-first approach - all stream data comes from D1 database. Active streams are synced on-demand via `POST /api/streams/:id/sync` endpoint. React Query staleTime (30s) + DB `lastSyncedAt` (60s) provide throttling.

**Tech Stack:** Hono (API), Drizzle ORM (D1), React Query (frontend), @solana-tdp/sdk (on-chain fetch)

---

## Files Overview

### API (apps/api/)

| File                                             | Action | Purpose                                      |
| ------------------------------------------------ | ------ | -------------------------------------------- |
| `src/db/schema.ts`                               | Modify | Add metadata columns to streams table        |
| `src/db/migrations/0002_add_stream_metadata.sql` | Create | Migration for new columns                    |
| `src/services/stream-service.ts`                 | Modify | Add syncStream method, update createStream   |
| `src/routes/streams.ts`                          | Modify | Add sync endpoint, pass new fields on create |

### Frontend (apps/web/)

| File                                                           | Action | Purpose                                        |
| -------------------------------------------------------------- | ------ | ---------------------------------------------- |
| `app/hooks/use-api.ts`                                         | Modify | Update StreamRecord type, add useStreamSync    |
| `app/hooks/use-stream-detail.ts`                               | Modify | Use API data instead of on-chain               |
| `app/routes/app.dashboard.tsx`                                 | Modify | Add background sync for active streams         |
| `app/components/streams/stream-list/stream-list.tsx`           | Modify | Use useApiStreams, API types                   |
| `app/components/streams/stream-card/stream-card.tsx`           | Modify | Accept API type, compute claimable client-side |
| `app/components/streams/stream-list/milestone-stream-card.tsx` | Modify | Accept API type                                |

---

## Task 1: DB Schema - Add Metadata Columns

**Files:**

- Modify: `apps/api/src/db/schema.ts`
- Create: `apps/api/src/db/migrations/0002_add_stream_metadata.sql`

- [ ] **Step 1: Update schema.ts**

Add new columns to `streams` table:

```typescript
// After line 65 (amountWithdrawn), add:
tokenName: text("token_name"),
tokenSymbol: text("token_symbol"),
tokenDecimals: integer("token_decimals"),

// After milestoneAuthority (line 59), add:
creatorDisplayName: text("creator_display_name"),
description: text("description"),
```

- [ ] **Step 2: Create migration file**

Create `apps/api/src/db/migrations/0002_add_stream_metadata.sql`:

```sql
-- Add metadata columns to streams table
ALTER TABLE streams ADD COLUMN token_name TEXT;
ALTER TABLE streams ADD COLUMN token_symbol TEXT;
ALTER TABLE streams ADD COLUMN token_decimals INTEGER;
ALTER TABLE streams ADD COLUMN creator_display_name TEXT;
ALTER TABLE streams ADD COLUMN description TEXT;
```

- [ ] **Step 3: Verify schema compiles**

Run: `cd apps/api && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/db/schema.ts apps/api/src/db/migrations/0002_add_stream_metadata.sql
git commit -m "feat(api): add metadata columns to streams table"
```

---

## Task 2: API - Update CreateStreamInput and Service

**Files:**

- Modify: `apps/api/src/services/stream-service.ts:7-22`

- [ ] **Step 1: Update CreateStreamInput interface**

```typescript
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
  // New metadata fields
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  creatorDisplayName?: string;
  description?: string;
}
```

- [ ] **Step 2: Update createStream method**

In `createStreamService`, update the `createStream` method to include new fields:

```typescript
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
      // New fields
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
```

- [ ] **Step 3: Verify types compile**

Run: `cd apps/api && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/services/stream-service.ts
git commit -m "feat(api): add metadata fields to CreateStreamInput"
```

---

## Task 3: API - Add Sync Endpoint

**Files:**

- Modify: `apps/api/src/services/stream-service.ts` (add syncStream method)
- Modify: `apps/api/src/routes/streams.ts` (add POST /:id/sync route)

- [ ] **Step 1: Add syncStream method to service**

Add to `stream-service.ts` after `updateMilestoneReached`:

```typescript
async syncStream(streamId: string) {
  const stream = await this.getStreamById(streamId);
  if (!stream) return null;

  const now = Math.floor(Date.now() / 1000);

  // Skip if synced within 60 seconds
  if (stream.lastSyncedAt && now - stream.lastSyncedAt < 60) {
    return stream;
  }

  // TODO: Fetch on-chain state via RPC
  // For now, just update lastSyncedAt
  // In Task 4, we'll add the actual on-chain fetch

  await db
    .update(streams)
    .set({ lastSyncedAt: now })
    .where(eq(streams.id, streamId));

  return this.getStreamById(streamId);
},
```

- [ ] **Step 2: Add sync route**

Add to `routes/streams.ts` after the `GET /:id` route:

```typescript
streamRoutes.post("/:id/sync", async (c) => {
  const db = createDb(c.env.DB);
  const service = createStreamService(db);
  const streamId = c.req.param("id");

  const stream = await service.getStreamById(streamId);
  if (!stream) {
    return c.json({ error: "Stream not found" }, 404);
  }

  const synced = await service.syncStream(streamId);
  return c.json(synced);
});
```

- [ ] **Step 3: Verify types compile**

Run: `cd apps/api && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/services/stream-service.ts apps/api/src/routes/streams.ts
git commit -m "feat(api): add sync endpoint for on-demand on-chain sync"
```

---

## Task 4: API - Implement On-Chain Fetch in Sync

**Files:**

- Modify: `apps/api/src/services/stream-service.ts` (update syncStream with RPC fetch)

- [ ] **Step 1: Add RPC URL to Env type**

Check `apps/api/env.d.ts` and add if missing:

```typescript
interface Env {
  DB: D1Database;
  SOLANA_RPC_URL?: string;
  // ... existing fields
}
```

- [ ] **Step 2: Update syncStream with on-chain fetch**

Replace the TODO in `syncStream`:

```typescript
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
    await db
      .update(streams)
      .set({ lastSyncedAt: now })
      .where(eq(streams.id, streamId));
    return this.getStreamById(streamId);
  }

  // Fetch on-chain state
  // Note: This requires @solana/web3.js in the API
  // For now, we'll implement a simple version that checks account existence
  // The full implementation will use the SDK's fetch functions

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

    const data = await response.json() as { result?: { value: unknown } };
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
      await db
        .update(streams)
        .set({ lastSyncedAt: now })
        .where(eq(streams.id, streamId));
    } else {
      // Just update sync time
      await db
        .update(streams)
        .set({ lastSyncedAt: now })
        .where(eq(streams.id, streamId));
    }
  } catch {
    // On error, still update sync time to avoid hammering
    await db
      .update(streams)
      .set({ lastSyncedAt: now })
      .where(eq(streams.id, streamId));
  }

  return this.getStreamById(streamId);
},
```

- [ ] **Step 3: Update route to pass RPC URL**

Update `routes/streams.ts` sync route:

```typescript
streamRoutes.post("/:id/sync", async (c) => {
  const db = createDb(c.env.DB);
  const service = createStreamService(db);
  const streamId = c.req.param("id");
  const rpcUrl = c.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

  const stream = await service.getStreamById(streamId);
  if (!stream) {
    return c.json({ error: "Stream not found" }, 404);
  }

  const synced = await service.syncStream(streamId, rpcUrl);
  return c.json(synced);
});
```

- [ ] **Step 4: Verify types compile**

Run: `cd apps/api && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/stream-service.ts apps/api/src/routes/streams.ts
git commit -m "feat(api): implement on-chain fetch in sync endpoint"
```

---

## Task 5: API - Update Create Route for New Fields

**Files:**

- Modify: `apps/api/src/routes/streams.ts` (pass new fields on create, auto-populate creatorDisplayName)

- [ ] **Step 1: Add user lookup to create route**

In the `POST /` route, add logic to look up creator's display name:

```typescript
import { createDb } from "../db";
import { createStreamService } from "../services/stream-service";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// ... inside POST / route:

// Auto-populate creatorDisplayName if not provided
let creatorDisplayName = body.creatorDisplayName;
if (!creatorDisplayName) {
  const db = createDb(c.env.DB);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, body.creatorAddress))
    .limit(1);
  creatorDisplayName = user[0]?.displayName ?? null;
}

const stream = await service.createStream({
  id: body.id,
  type: body.type,
  creatorAddress: body.creatorAddress,
  recipientAddress: body.recipientAddress,
  mintAddress: body.mintAddress,
  vaultAddress: body.vaultAddress,
  amount: body.amount,
  orgId: body.orgId,
  startTime: body.startTime,
  endTime: body.endTime,
  cliffTime: body.cliffTime,
  milestoneAuthority: body.milestoneAuthority,
  creationTx: body.creationTx,
  createdAt: body.createdAt,
  // New metadata fields
  tokenName: body.tokenName,
  tokenSymbol: body.tokenSymbol,
  tokenDecimals: body.tokenDecimals,
  creatorDisplayName,
  description: body.description,
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/routes/streams.ts
git commit -m "feat(api): pass metadata fields on stream creation with auto-populated creator name"
```

---

## Task 6: Frontend - Update StreamRecord Type and Add useStreamSync

**Files:**

- Modify: `apps/web/app/hooks/use-api.ts`

- [ ] **Step 1: Update StreamRecord interface**

Add new fields to `StreamRecord` (line 7-22):

```typescript
interface StreamRecord {
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
  // New metadata fields
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  creatorDisplayName?: string;
  description?: string;
}
```

- [ ] **Step 2: Update StreamWithEvents interface**

Add new fields to `StreamWithEvents` (line 32-38):

```typescript
interface StreamWithEvents extends StreamRecord {
  status: string;
  amountWithdrawn: string;
  milestoneReached: boolean;
  closedAt: number | null;
  closeTx: string | null;
  lastSyncedAt: number | null;
  events: StreamEventRecord[];
}
```

- [ ] **Step 3: Add useStreamSync hook**

Add after `useRecordStreamEvent` (line 67):

```typescript
export function useStreamSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) => api.post(`/api/streams/${streamId}/sync`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-streams"] });
      void queryClient.invalidateQueries({ queryKey: ["api-stream"] });
    },
  });
}
```

- [ ] **Step 4: Export new types**

Add exports for the types:

```typescript
export type { StreamRecord, StreamEventRecord, StreamWithEvents };
```

- [ ] **Step 5: Verify types compile**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/hooks/use-api.ts
git commit -m "feat(web): update API types and add useStreamSync hook"
```

---

## Task 7: Frontend - Update StreamList to Use API

**Files:**

- Modify: `apps/web/app/components/streams/stream-list/stream-list.tsx`

- [ ] **Step 1: Update imports**

Replace on-chain imports with API imports:

```typescript
import { getVaultPda, PROGRAM_ID } from "@solana-tdp-sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect } from "react";

import { useTriggerMilestone } from "@/hooks/tx/use-trigger-milestone";
import { useWithdrawMilestone } from "@/hooks/tx/use-withdraw-milestone";
import { useApiStreams, useStreamSync, type StreamWithEvents } from "@/hooks/use-api";
import { useAuth } from "@/lib/solana/use-auth";

import { CancelDialog } from "../cancel-dialog";
import { CancelMilestoneDialog } from "../cancel-milestone-dialog";
import { StreamCard } from "../stream-card/stream-card";
import { MilestoneStreamCard } from "./milestone-stream-card";
```

- [ ] **Step 2: Remove old interfaces and update state types**

Replace interfaces (lines 17-35):

```typescript
interface SelectedStream {
  stream: StreamWithEvents;
  pda: string;
}

interface SelectedMilestoneStream {
  stream: StreamWithEvents;
  pda: string;
}
```

- [ ] **Step 3: Update component to use API hooks**

Replace the data fetching (lines 38-45):

```typescript
export function StreamList({ role }: { role: "created" | "received" }) {
  const { publicKey } = useAuth();
  const [selected, setSelected] = useState<SelectedStream | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<SelectedMilestoneStream | null>(null);
  const triggerMilestone = useTriggerMilestone();
  const withdrawMilestone = useWithdrawMilestone();
  const sync = useStreamSync();

  const walletAddress = publicKey?.toBase58();
  const { data: streams, isLoading } = useApiStreams({
    creator: role === "created" ? walletAddress : undefined,
    recipient: role === "received" ? walletAddress : undefined,
  });

  // Background sync for active stale streams
  useEffect(() => {
    if (!streams) return;
    const now = Math.floor(Date.now() / 1000);
    const stale = streams.filter(
      (s) =>
        s.status === "active" &&
        (!s.lastSyncedAt || now - s.lastSyncedAt > 60),
    );
    // Sync max 5 streams at a time to avoid hammering
    stale.slice(0, 5).forEach((s) => sync.mutate(s.id));
  }, [streams]);
```

- [ ] **Step 4: Update filtering logic**

Replace the filtering (lines 49-65):

```typescript
const timeStreams = (streams ?? []).filter((s) => s.type === "time");
const milestoneStreams = (streams ?? []).filter((s) => s.type === "milestone");
```

- [ ] **Step 5: Update rendering to use API types**

Update the rendering section to pass API data to cards. This will be completed in Tasks 8 and 9 when we update the card components.

- [ ] **Step 6: Verify types compile**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: May have type errors - we'll fix them in Tasks 8-9

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/components/streams/stream-list/stream-list.tsx
git commit -m "feat(web): update StreamList to use API data"
```

---

## Task 8: Frontend - Update StreamCard for API Types

**Files:**

- Modify: `apps/web/app/components/streams/stream-card/stream-card.tsx`

- [ ] **Step 1: Update imports**

```typescript
import { getVaultPda, PROGRAM_ID } from "@solana-tdp-sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Link } from "@tanstack/react-router";
import BN from "bn.js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWithdraw } from "@/hooks/tx/use-withdraw";
import type { StreamWithEvents } from "@/hooks/use-api";
import { useAuth } from "@/lib/solana/use-auth";
import { formatSol, formatDuration } from "@/utils/format";

import { StreamProgressBar } from "./stream-progress-bar";
```

- [ ] **Step 2: Update component signature and data processing**

Replace the component:

```typescript
export function StreamCard({
  stream,
  onCancel,
  role,
}: {
  stream: StreamWithEvents;
  onCancel: (stream: StreamWithEvents, pda: string) => void;
  role?: "created" | "received";
}) {
  const { publicKey } = useAuth();
  const withdraw = useWithdraw();

  const pda = new PublicKey(stream.id);
  const creatorPk = new PublicKey(stream.creatorAddress);
  const recipientPk = new PublicKey(stream.recipientAddress);
  const mintPk = new PublicKey(stream.mintAddress);

  const isSender = publicKey?.equals(creatorPk);
  const isRecipient = publicKey?.equals(recipientPk);
  const counterparty = isSender ? recipientPk : creatorPk;

  const clockTime = Math.floor(Date.now() / 1000);
  const startTime = stream.startTime ?? 0;
  const endTime = stream.endTime ?? 0;
  const amount = new BN(stream.amount);
  const amountWithdrawn = new BN(stream.amountWithdrawn ?? "0");

  // Compute claimable (simplified - server sync handles accuracy)
  const status = stream.status as "active" | "completed" | "cancelled";

  let claimable = new BN(0);
  if (status === "active" && endTime > 0) {
    if (clockTime >= endTime) {
      claimable = amount.sub(amountWithdrawn);
    } else if (clockTime >= startTime) {
      const elapsed = clockTime - startTime;
      const duration = endTime - startTime;
      const vested = amount.muln(elapsed).divn(duration);
      claimable = vested.sub(amountWithdrawn);
      if (claimable.lt(new BN(0))) claimable = new BN(0);
    }
  }

  const [vaultPda] = getVaultPda(pda, PROGRAM_ID);
  const recipientToken = publicKey ? getAssociatedTokenAddressSync(mintPk, publicKey) : pda;

  const totalSec = endTime - startTime;
  const elapsedSec = Math.max(0, clockTime - startTime);
  const remainingSec = Math.max(0, totalSec - elapsedSec);
  const progress = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;

  const statusColor =
    status === "cancelled"
      ? ("warn" as const)
      : status === "completed"
        ? ("sol2" as const)
        : ("sol" as const);
```

- [ ] **Step 3: Update JSX to use new data**

Update the rendering to use string addresses and computed values:

```typescript
  return (
    <div className="rounded-xl border border-border bg-bg1 px-5 py-4 transition-colors hover:border-border2">
      <div className="flex items-start justify-between gap-4">
        <Link
          to="/app/streams/$streamPda"
          params={{ streamPda: stream.id }}
          className="min-w-0 flex-1 space-y-2 no-underline hover:no-underline"
        >
          <div className="flex items-center gap-2">
            <Badge variant={statusColor}>{status}</Badge>
            <span className="font-mono text-xs text-dim">
              {stream.tokenSymbol ?? stream.mintAddress.slice(0, 8)}
            </span>
            {stream.creatorDisplayName && (
              <span className="text-xs text-dim">by {stream.creatorDisplayName}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div>
              <span className="text-dim">Token</span>
              <p className="font-mono text-text">
                {stream.tokenName ?? stream.mintAddress.slice(0, 8) + "..."}
              </p>
            </div>
            <div>
              <span className="text-dim">{isSender ? "Recipient" : "Sender"}</span>
              <p className="font-mono text-text">
                {isSender && "→ "}
                {isRecipient && "← "}
                {counterparty.toBase58().slice(0, 8)}...
              </p>
            </div>
            <div>
              <span className="text-dim">Total</span>
              <p className="text-text">{formatSol(amount, stream.tokenDecimals ?? 6)}</p>
            </div>
            <div>
              <span className="text-dim">Claimable</span>
              <p className="text-text">{formatSol(claimable, stream.tokenDecimals ?? 6)}</p>
            </div>
            <div>
              <span className="text-dim">Withdrawn</span>
              <p className="text-text">{formatSol(amountWithdrawn, stream.tokenDecimals ?? 6)}</p>
            </div>
            <div>
              <span className="text-dim">Remaining</span>
              <p className="text-text">
                {status === "active" ? formatDuration(remainingSec) : "—"}
              </p>
            </div>
          </div>

          {stream.description && (
            <p className="text-xs text-dim italic">{stream.description}</p>
          )}

          <StreamProgressBar
            progress={progress}
            startTime={new BN(startTime)}
            endTime={new BN(endTime)}
          />
        </Link>

        <div className="flex shrink-0 flex-col gap-2">
          {role !== "received" &&
            isSender &&
            status === "active" &&
            clockTime < endTime && (
              <Button variant="destructive" size="sm" onClick={() => onCancel(stream, stream.id)}>
                Cancel
              </Button>
            )}
          {role === "received" &&
            isRecipient &&
            status === "active" &&
            claimable.gt(new BN(0)) && (
              <Button
                size="sm"
                onClick={() =>
                  withdraw.mutate({
                    stream: pda,
                    vault: vaultPda,
                    sender: creatorPk,
                    mint: mintPk,
                    recipientToken,
                    amount: claimable.toNumber(),
                  })
                }
                disabled={withdraw.isPending}
              >
                {withdraw.isPending ? "Claiming..." : "Claim"}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify types compile**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/components/streams/stream-card/stream-card.tsx
git commit -m "feat(web): update StreamCard to use API types"
```

---

## Task 9: Frontend - Update MilestoneStreamCard for API Types

**Files:**

- Modify: `apps/web/app/components/streams/stream-list/milestone-stream-card.tsx`

- [ ] **Step 1: Update imports**

```typescript
import { PublicKey } from "@solana/web3.js";
import { Link } from "@tanstack/react-router";
import BN from "bn.js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StreamWithEvents } from "@/hooks/use-api";
import { formatSol } from "@/utils/format";
```

- [ ] **Step 2: Update component signature**

```typescript
export function MilestoneStreamCard({
  stream,
  role,
  isRecipient,
  canTrigger,
  onTrigger,
  onCancel,
  onClaim,
  triggerPending,
  cancelPending,
  withdrawPending,
}: {
  stream: StreamWithEvents;
  role: "created" | "received";
  isRecipient: boolean;
  canTrigger: boolean;
  onTrigger: () => void;
  onCancel: () => void;
  onClaim: () => void;
  triggerPending: boolean;
  cancelPending: boolean;
  withdrawPending: boolean;
}) {
  const milestoneReached = stream.milestoneReached ?? false;
  const cancelled = stream.status === "cancelled";
```

- [ ] **Step 3: Update JSX**

```typescript
  return (
    <div className="rounded-xl border border-border bg-bg1 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <Link
          to="/app/streams/$streamPda"
          params={{ streamPda: stream.id }}
          className="min-w-0 flex-1 space-y-1 no-underline hover:no-underline"
        >
          <div className="flex items-center gap-2">
            <Badge variant={milestoneReached ? "sol2" : "sol"}>
              {milestoneReached ? "completed" : "active"}
            </Badge>
            <span className="font-mono text-xs text-dim">
              {stream.tokenSymbol ?? "Milestone stream"}
            </span>
            {stream.creatorDisplayName && (
              <span className="text-xs text-dim">by {stream.creatorDisplayName}</span>
            )}
          </div>
          <p className="text-sm text-text">
            {stream.recipientAddress.slice(0, 8)}... — {stream.amount} tokens
          </p>
          <p className="text-xs text-dim">
            Claimed: {formatSol(new BN(stream.amountWithdrawn ?? "0"), stream.tokenDecimals ?? 6)}
          </p>
          {stream.description && (
            <p className="text-xs text-dim italic">{stream.description}</p>
          )}
        </Link>
        <div className="flex shrink-0 flex-col gap-2">
          {canTrigger && (
            <Button size="sm" onClick={onTrigger} disabled={triggerPending}>
              {triggerPending ? "Completing..." : "Complete Milestone"}
            </Button>
          )}
          {role === "created" && !milestoneReached && !cancelled && (
            <Button variant="destructive" size="sm" onClick={onCancel} disabled={cancelPending}>
              {cancelPending ? "Cancelling..." : "Cancel"}
            </Button>
          )}
          {role === "received" && isRecipient && milestoneReached && (
            <Button size="sm" onClick={onClaim} disabled={withdrawPending}>
              {withdrawPending ? "Claiming..." : "Claim"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify types compile**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/components/streams/stream-list/milestone-stream-card.tsx
git commit -m "feat(web): update MilestoneStreamCard to use API types"
```

---

## Task 10: Frontend - Update StreamList Rendering

**Files:**

- Modify: `apps/web/app/components/streams/stream-list/stream-list.tsx`

- [ ] **Step 1: Update rendering to pass API data**

Replace the rendering section (lines 116-159):

```typescript
      <div className="space-y-3">
        {timeStreams.map((s) => (
          <StreamCard
            key={s.id}
            stream={s}
            role={role}
            onCancel={(stream, pda) => setSelected({ stream, pda })}
          />
        ))}

        {milestoneStreams.map((s) => {
          const canTrigger = role === "created" && !s.milestoneReached;
          const isRecipient = walletAddress === s.recipientAddress;
          return (
            <MilestoneStreamCard
              key={s.id}
              stream={s}
              role={role}
              isRecipient={isRecipient}
              canTrigger={canTrigger}
              onTrigger={() => {
                const pda = new PublicKey(s.id);
                triggerMilestone.mutate(pda);
              }}
              onCancel={() => setSelectedMilestone({ stream: s, pda: s.id })}
              onClaim={() => {
                const pda = new PublicKey(s.id);
                const mintPk = new PublicKey(s.mintAddress);
                const creatorPk = new PublicKey(s.creatorAddress);
                const [vaultPda] = getVaultPda(pda, PROGRAM_ID);
                const recipientToken = publicKey
                  ? getAssociatedTokenAddressSync(mintPk, publicKey)
                  : pda;
                withdrawMilestone.mutate({
                  stream: pda,
                  vault: vaultPda,
                  sender: creatorPk,
                  mint: mintPk,
                  recipientToken,
                });
              }}
              triggerPending={triggerMilestone.isPending}
              cancelPending={false}
              withdrawPending={withdrawMilestone.isPending}
            />
          );
        })}
      </div>
```

- [ ] **Step 2: Update dialog rendering**

Update the dialog sections to use API types:

```typescript
      {selected && (
        <CancelDialog
          stream={/* Need to convert API type to on-chain type */}
          pda={new PublicKey(selected.pda)}
          onClose={() => setSelected(null)}
        />
      )}
```

**Note:** The cancel/withdraw dialogs still expect on-chain types. We have two options:

1. Convert API type to on-chain type (create PublicKey objects)
2. Update dialogs to accept API types

For now, we'll convert API type to a minimal on-chain compatible type. This is a temporary solution until we refactor the dialogs.

- [ ] **Step 3: Verify types compile**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: May have errors with dialog types - we'll address in a follow-up

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/components/streams/stream-list/stream-list.tsx
git commit -m "feat(web): complete StreamList rendering with API types"
```

---

## Task 11: Frontend - Update Stream Detail Page

**Files:**

- Modify: `apps/web/app/routes/app.streams.$streamPda.tsx`
- Modify: `apps/web/app/hooks/use-stream-detail.ts`

- [ ] **Step 1: Update useStreamDetail to use API-first**

Replace `use-stream-detail.ts` to use API data as primary source:

```typescript
import {
  getClaimable,
  getStatus,
  getVestedPercent,
  getMilestoneStatus,
  getMilestoneClaimable,
} from "@solana-tdp/sdk";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { useMemo } from "react";

import { useApiStream, useStreamSync, type StreamWithEvents } from "@/hooks/use-api";

type StreamType = "linear" | "cliff" | "milestone";
type StreamStatus = "active" | "completed" | "cancelled";

interface StreamDetailBase {
  pda: string;
  apiType: "time" | "milestone";
  creator: string;
  recipient: string;
  mint: string;
  vault: string;
  amount: string;
  startTime?: number;
  endTime?: number;
  cliffTime?: number;
  milestoneAuthority?: string;
  creationTx: string;
  orgId?: string | null;
  createdAt: number;

  amountWithdrawn: string;
  cancelled: boolean;
  milestoneReached: boolean;

  status: StreamStatus;
  claimable: BN;
  vestedPercent: number;

  // Metadata
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  creatorDisplayName?: string;
  description?: string;
}

interface TimeStreamDetail extends StreamDetailBase {
  streamType: "linear" | "cliff";
}

interface MilestoneStreamDetail extends StreamDetailBase {
  streamType: "milestone";
}

type StreamDetail = TimeStreamDetail | MilestoneStreamDetail;

function computeDetailFromApi(api: StreamWithEvents): StreamDetail {
  const clockTime = Math.floor(Date.now() / 1000);
  const startTime = api.startTime ?? 0;
  const endTime = api.endTime ?? 0;
  const cliffTime = api.cliffTime ?? 0;
  const amount = new BN(api.amount);
  const amountWithdrawn = new BN(api.amountWithdrawn ?? "0");
  const cancelled = api.status === "cancelled";
  const milestoneReached = api.milestoneReached ?? false;

  // Determine stream type
  const streamType: StreamType =
    api.type === "milestone" ? "milestone" : cliffTime > startTime ? "cliff" : "linear";

  // Compute status
  let status: StreamStatus;
  if (cancelled) status = "cancelled";
  else if (api.status === "completed") status = "completed";
  else if (endTime > 0 && clockTime >= endTime) status = "completed";
  else status = "active";

  // Compute claimable
  let claimable = new BN(0);
  let vestedPercent = 0;

  if (streamType === "milestone") {
    if (milestoneReached && !cancelled) {
      claimable = amount.sub(amountWithdrawn);
      if (claimable.lt(new BN(0))) claimable = new BN(0);
      vestedPercent = amount.gt(new BN(0)) ? amountWithdrawn.muln(100).div(amount).toNumber() : 0;
    }
  } else if (status === "active" && endTime > 0) {
    if (clockTime >= endTime) {
      claimable = amount.sub(amountWithdrawn);
      vestedPercent = 100;
    } else if (clockTime >= startTime) {
      const elapsed = clockTime - startTime;
      const duration = endTime - startTime;
      const vested = amount.muln(elapsed).divn(duration);
      claimable = vested.sub(amountWithdrawn);
      if (claimable.lt(new BN(0))) claimable = new BN(0);
      vestedPercent = amount.gt(new BN(0)) ? vested.muln(100).div(amount).toNumber() : 0;
    }
  }

  return {
    pda: api.id,
    apiType: api.type,
    creator: api.creatorAddress,
    recipient: api.recipientAddress,
    mint: api.mintAddress,
    vault: api.vaultAddress,
    amount: api.amount,
    startTime: api.startTime,
    endTime: api.endTime,
    cliffTime: api.cliffTime,
    milestoneAuthority: api.milestoneAuthority,
    creationTx: api.creationTx,
    orgId: api.orgId,
    createdAt: api.createdAt,
    amountWithdrawn: api.amountWithdrawn ?? "0",
    cancelled,
    milestoneReached,
    status,
    claimable,
    vestedPercent,
    streamType,
    tokenName: api.tokenName,
    tokenSymbol: api.tokenSymbol,
    tokenDecimals: api.tokenDecimals,
    creatorDisplayName: api.creatorDisplayName,
    description: api.description,
  };
}

export function useStreamDetail(pda: string | undefined) {
  const { data: apiData, isLoading, isError, error } = useApiStream(pda ?? "");
  const sync = useStreamSync();

  // Trigger sync on mount for active streams
  useMemo(() => {
    if (apiData?.status === "active") {
      sync.mutate(apiData.id);
    }
  }, [apiData?.id]);

  const detail = useMemo<StreamDetail | null>(() => {
    if (!apiData) return null;
    return computeDetailFromApi(apiData);
  }, [apiData]);

  return {
    detail,
    isLoading,
    isError,
    error,
  };
}

export type { StreamDetail, TimeStreamDetail, MilestoneStreamDetail, StreamType, StreamStatus };
```

- [ ] **Step 2: Verify types compile**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/hooks/use-stream-detail.ts
git commit -m "feat(web): refactor useStreamDetail to API-first"
```

---

## Task 12: Verification and Testing

- [ ] **Step 1: Run full typecheck**

```bash
cd apps/api && pnpm exec tsc --noEmit
cd apps/web && pnpm exec tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No errors (warnings OK)

- [ ] **Step 3: Run Anchor tests**

```bash
cd apps/solana-tdp-anchor && pnpm test
```

Expected: 69/69 tests pass

- [ ] **Step 4: Start dev server and test manually**

```bash
pnpm dev
```

Test scenarios:

1. Dashboard loads streams from API
2. Active streams show correct status
3. Clicking a stream opens detail page
4. Detail page shows stream data
5. Background sync updates stale streams

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete API-first dashboard implementation"
```

---

## Implementation Order

Execute tasks in this order:

1. **Task 1** - DB schema (no dependencies)
2. **Task 2** - API service types (depends on Task 1)
3. **Task 3** - API sync endpoint skeleton (depends on Task 2)
4. **Task 4** - API sync implementation (depends on Task 3)
5. **Task 5** - API create route (depends on Task 2)
6. **Task 6** - Frontend types and hooks (depends on Task 3)
7. **Task 7** - StreamList update (depends on Task 6)
8. **Task 8** - StreamCard update (depends on Task 6)
9. **Task 9** - MilestoneStreamCard update (depends on Task 6)
10. **Task 10** - StreamList rendering (depends on Tasks 7-9)
11. **Task 11** - Stream detail page (depends on Task 6)
12. **Task 12** - Verification (depends on all)

Tasks 1-5 can be done in parallel with Tasks 6-11 (API vs Frontend).
