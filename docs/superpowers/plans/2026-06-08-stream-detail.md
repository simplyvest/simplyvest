# Stream Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a stream detail page at `/app/streams/:streamPda` with role-based views (creator vs recipient), showing real-time on-chain state and API event history.

**Architecture:** Hybrid data — API for stream metadata + event history, on-chain for real-time vesting state. Single route with role detection. Small composable components.

**Tech Stack:** React 19, TanStack Router, TanStack Query, Hono (API), Drizzle ORM (D1), @solana-tdp-sdk

---

## File Structure

```
apps/api/src/
├── services/stream-service.ts        (modify — add updateStreamAmountWithdrawn, updateMilestoneReached)
├── routes/streams.ts                 (modify — event endpoint updates stream fields)

apps/web/app/
├── routes/app.streams.$streamPda.tsx (create — detail page route)
├── hooks/
│   ├── use-stream-detail.ts          (create — merged on-chain + API data)
│   ├── use-stream-role.ts            (create — role detection)
│   └── use-stream-events.ts          (create — API event history)
├── components/streams/detail/
│   ├── stream-detail-layout.tsx      (create — page shell)
│   ├── stream-detail-grid.tsx        (create — 2-column grid)
│   ├── stream-addresses.tsx          (create — addresses with copy/explorer)
│   ├── stream-amounts.tsx            (create — total/withdrawn/claimable)
│   ├── stream-timeline.tsx           (create — dates + progress bar)
│   ├── stream-status-badge.tsx       (create — status pill)
│   ├── claim-button.tsx              (create — recipient claim action)
│   ├── cancel-button.tsx             (create — creator cancel action)
│   ├── trigger-milestone-button.tsx  (create — creator milestone action)
│   ├── stream-event-list.tsx         (create — event history list)
│   └── stream-event-item.tsx         (create — single event row)
├── components/streams/stream-card/
│   └── stream-card.tsx               (modify — add link to detail page)
```

---

## Task 1: API — Update stream fields on event recording

**Files:**

- Modify: `apps/api/src/services/stream-service.ts`
- Modify: `apps/api/src/routes/streams.ts`

- [ ] **Step 1: Add `updateStreamAmountWithdrawn` to stream service**

```ts
// In createStreamService, after updateStreamStatus:

async updateStreamAmountWithdrawn(streamId: string, amountWithdrawn: string) {
  await db
    .update(streams)
    .set({ amountWithdrawn })
    .where(eq(streams.id, streamId));
},

async updateMilestoneReached(streamId: string) {
  await db
    .update(streams)
    .set({ milestoneReached: true })
    .where(eq(streams.id, streamId));
},
```

- [ ] **Step 2: Update event endpoint to apply stream field changes**

In `apps/api/src/routes/streams.ts`, modify the `POST /:id/events` handler:

```ts
// After creating the event, update stream fields based on event type:
const event = await service.createEvent({ ... });

// Update stream fields based on event type
if (body.eventType === "completed" || body.eventType === "cancelled") {
  await service.updateStreamStatus(streamId, body.eventType === "completed" ? "completed" : "cancelled", body.txSignature);
} else if (body.eventType === "withdrawn" && body.amount) {
  // Increment amountWithdrawn
  const current = await service.getStreamById(streamId);
  if (current) {
    const prev = BigInt(current.amountWithdrawn ?? "0");
    const withdrawn = BigInt(body.amount);
    await service.updateStreamAmountWithdrawn(streamId, (prev + withdrawn).toString());
  }
} else if (body.eventType === "milestone_triggered") {
  await service.updateMilestoneReached(streamId);
}

return c.json(event, 201);
```

- [ ] **Step 3: Typecheck API**

Run: `cd apps/api && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/services/stream-service.ts apps/api/src/routes/streams.ts
git commit -m "feat(api): update stream fields on event recording"
```

---

## Task 2: Web — `useStreamEvents` hook

**Files:**

- Create: `apps/web/app/hooks/use-stream-events.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface StreamEventRecord {
  id: string;
  streamId: string;
  eventType: "created" | "withdrawn" | "milestone_triggered" | "completed" | "cancelled";
  actorAddress: string;
  amount: string | null;
  txSignature: string;
  blockTime: number;
  createdAt: number;
}

interface StreamWithEvents {
  id: string;
  type: "time" | "milestone";
  creatorAddress: string;
  recipientAddress: string;
  mintAddress: string;
  vaultAddress: string;
  amount: string;
  orgId: string | null;
  startTime: number | null;
  endTime: number | null;
  cliffTime: number | null;
  milestoneAuthority: string | null;
  milestoneReached: boolean;
  status: string;
  amountWithdrawn: string;
  creationTx: string;
  createdAt: number;
  closedAt: number | null;
  closeTx: string | null;
  events: StreamEventRecord[];
}

export function useStreamEvents(pda: string) {
  return useQuery({
    queryKey: ["api-stream", pda],
    queryFn: () => api.get<StreamWithEvents>(`/api/streams/${pda}`),
    enabled: !!pda,
  });
}

export type { StreamWithEvents, StreamEventRecord };
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/hooks/use-stream-events.ts
git commit -m "feat(web): add useStreamEvents hook"
```

---

## Task 3: Web — `useStreamDetail` hook

**Files:**

- Create: `apps/web/app/hooks/use-stream-detail.ts`

- [ ] **Step 1: Create the hook**

Merges API metadata with on-chain real-time state.

```ts
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {
  fetchStream,
  fetchMilestoneStream,
  getClaimable,
  getStatus,
  getMilestoneStatus,
  getMilestoneClaimable,
  isMilestoneClaimable,
} from "@solana-tdp/sdk";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import { useQuery } from "@tanstack/react-query";
import { useConnection } from "@/lib/solana/use-connection";
import { useProgram } from "./use-program";
import { useStreamEvents } from "./use-stream-events";

type StreamType = "linear" | "cliff" | "milestone";
type StreamStatus = "active" | "completed" | "cancelled";

interface StreamDetail {
  // From API
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

  // From on-chain
  amountWithdrawn: string;
  cancelled: boolean;
  milestoneReached: boolean;

  // Computed
  streamType: StreamType;
  status: StreamStatus;
  claimable: BN;
  vestedPercent: number;

  // Raw on-chain account (for actions)
  onChainAccount: StreamAccount | MilestoneStreamAccount | null;
}

export function useStreamDetail(pda: string | undefined) {
  const { connection } = useConnection();
  const program = useProgram();
  const apiQuery = useStreamEvents(pda ?? "");

  const onChainQuery = useQuery({
    queryKey: ["stream-onchain", pda],
    queryFn: async () => {
      if (!pda) return null;
      const pubkey = new PublicKey(pda);

      // Try time stream first
      const timeStream = await fetchStream(connection, pubkey, program.programId);
      if (timeStream)
        return {
          type: "time" as const,
          account: timeStream.account,
          publicKey: timeStream.publicKey,
        };

      // Try milestone stream
      const milestoneStream = await fetchMilestoneStream(connection, pubkey, program.programId);
      if (milestoneStream)
        return {
          type: "milestone" as const,
          account: milestoneStream.account,
          publicKey: milestoneStream.publicKey,
        };

      return null;
    },
    enabled: !!pda,
    retry: 1,
  });

  const detail = useMemo<StreamDetail | null>(() => {
    if (!apiQuery.data || !onChainQuery.data) return null;

    const api = apiQuery.data;
    const onChain = onChainQuery.data;
    const clockTime = Math.floor(Date.now() / 1000);

    const isTime = onChain.type === "time";
    const account = onChain.account;

    // Determine stream type
    let streamType: StreamType;
    if (onChain.type === "milestone") {
      streamType = "milestone";
    } else {
      const timeAccount = account as StreamAccount;
      streamType = timeAccount.cliffTime.gt(timeAccount.startTime) ? "cliff" : "linear";
    }

    // Compute status and claimable
    let status: StreamStatus;
    let claimable: BN;
    let vestedPercent: number;
    let cancelled: boolean;
    let milestoneReached: boolean;
    let amountWithdrawn: string;

    if (streamType === "milestone") {
      const msAccount = account as MilestoneStreamAccount;
      status = getMilestoneStatus(msAccount);
      claimable = getMilestoneClaimable(msAccount);
      milestoneReached = msAccount.milestoneReached;
      cancelled = msAccount.cancelled;
      amountWithdrawn = msAccount.amountWithdrawn.toString();
      vestedPercent = milestoneReached
        ? msAccount.amountWithdrawn.gte(msAccount.amount)
          ? 100
          : Number(msAccount.amountWithdrawn.muln(100).div(msAccount.amount))
        : 0;
    } else {
      const timeAccount = account as StreamAccount;
      status = getStatus(timeAccount);
      claimable = getClaimable(timeAccount, clockTime);
      cancelled = timeAccount.cancelled;
      milestoneReached = false;
      amountWithdrawn = timeAccount.amountWithdrawn.toString();
      vestedPercent = getVestedPercent(timeAccount, clockTime);
    }

    return {
      pda: api.id,
      apiType: api.type,
      creator: api.creatorAddress,
      recipient: api.recipientAddress,
      mint: api.mintAddress,
      vault: api.vaultAddress,
      amount: api.amount,
      startTime: api.startTime ?? undefined,
      endTime: api.endTime ?? undefined,
      cliffTime: api.cliffTime ?? undefined,
      milestoneAuthority: api.milestoneAuthority ?? undefined,
      creationTx: api.creationTx,
      orgId: api.orgId,
      createdAt: api.createdAt,
      amountWithdrawn,
      cancelled,
      milestoneReached,
      streamType,
      status,
      claimable,
      vestedPercent,
      onChainAccount: account,
    };
  }, [apiQuery.data, onChainQuery.data]);

  return {
    detail,
    isLoading: apiQuery.isLoading || onChainQuery.isLoading,
    isError: apiQuery.isError || onChainQuery.isError,
    error: apiQuery.error ?? onChainQuery.error,
    apiQuery,
    onChainQuery,
  };
}

// Helper — getVestedPercent for time streams
function getVestedPercent(stream: StreamAccount, clockTime: number): number {
  if (stream.cancelled) {
    const total = stream.amount.toNumber();
    return total > 0 ? (stream.amountWithdrawn.toNumber() / total) * 100 : 0;
  }
  const total = stream.amount.toNumber();
  if (total === 0) return 0;
  const start = stream.startTime.toNumber();
  const end = stream.endTime.toNumber();
  const elapsed = Math.max(0, clockTime - start);
  const duration = end - start;
  if (duration <= 0) return 100;
  const vested = Math.min(total, (elapsed / duration) * total);
  return (vested / total) * 100;
}

export type { StreamDetail, StreamType, StreamStatus };
```

- [ ] **Step 2: Typecheck**

Run: `cd apps/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/hooks/use-stream-detail.ts
git commit -m "feat(web): add useStreamDetail hook with merged on-chain + API data"
```

---

## Task 4: Web — `useStreamRole` hook

**Files:**

- Create: `apps/web/app/hooks/use-stream-role.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useMemo } from "react";
import type { StreamDetail } from "./use-stream-detail";

type StreamRole = "creator" | "recipient" | "unknown";

export function useStreamRole(
  detail: StreamDetail | null,
  walletAddress: string | null | undefined,
): StreamRole {
  return useMemo(() => {
    if (!detail || !walletAddress) return "unknown";
    if (walletAddress === detail.creator) return "creator";
    if (walletAddress === detail.recipient) return "recipient";
    return "unknown";
  }, [detail, walletAddress]);
}

export type { StreamRole };
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/hooks/use-stream-role.ts
git commit -m "feat(web): add useStreamRole hook"
```

---

## Task 5: Web — `StreamStatusBadge` component

**Files:**

- Create: `apps/web/app/components/streams/detail/stream-status-badge.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  active: { label: "Active", variant: "sol" as const },
  completed: { label: "Completed", variant: "sol2" as const },
  cancelled: { label: "Cancelled", variant: "warn" as const },
};

export function StreamStatusBadge({ status }: { status: "active" | "completed" | "cancelled" }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/stream-status-badge.tsx
git commit -m "feat(web): add StreamStatusBadge component"
```

---

## Task 6: Web — `StreamAddresses` component

**Files:**

- Create: `apps/web/app/components/streams/detail/stream-addresses.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { formatAddress } from "@solana-tdp/sdk";
import { CopyButton } from "@/components/ui/copy-button";
import type { StreamDetail } from "@/hooks/use-stream-detail";

interface AddressRowProps {
  label: string;
  address: string;
}

function AddressRow({ label, address }: AddressRowProps) {
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=devnet`;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-dim">{label}</p>
        <p className="font-mono text-sm text-text truncate">{formatAddress(address)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <CopyButton value={address} />
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-dim hover:text-text"
        >
          Explorer
        </a>
      </div>
    </div>
  );
}

export function StreamAddresses({ detail }: { detail: StreamDetail }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Addresses</h3>
      <div className="space-y-2.5">
        <AddressRow label="Stream PDA" address={detail.pda} />
        <AddressRow label="Creator" address={detail.creator} />
        <AddressRow label="Recipient" address={detail.recipient} />
        <AddressRow label="Token Mint" address={detail.mint} />
        <AddressRow label="Vault" address={detail.vault} />
        {detail.milestoneAuthority && (
          <AddressRow label="Milestone Authority" address={detail.milestoneAuthority} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/stream-addresses.tsx
git commit -m "feat(web): add StreamAddresses component"
```

---

## Task 7: Web — `StreamAmounts` component

**Files:**

- Create: `apps/web/app/components/streams/detail/stream-amounts.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { formatSol } from "@/utils/format";
import type { StreamDetail } from "@/hooks/use-stream-detail";

export function StreamAmounts({ detail }: { detail: StreamDetail }) {
  const total = Number(detail.amount);
  const withdrawn = Number(detail.amountWithdrawn);
  const claimable = detail.claimable.toNumber();
  const remaining = total - withdrawn;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Amounts</h3>
      <div className="grid grid-cols-2 gap-3">
        <AmountCard label="Total" value={formatSol(total, 6)} />
        <AmountCard label="Withdrawn" value={formatSol(withdrawn, 6)} />
        <AmountCard label="Claimable" value={formatSol(claimable, 6)} highlight={claimable > 0} />
        <AmountCard label="Remaining" value={formatSol(remaining, 6)} />
      </div>
    </div>
  );
}

function AmountCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg0 p-3">
      <p className="text-xs text-dim">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-green-400" : "text-text"}`}>{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/stream-amounts.tsx
git commit -m "feat(web): add StreamAmounts component"
```

---

## Task 8: Web — `StreamTimeline` component

**Files:**

- Create: `apps/web/app/components/streams/detail/stream-timeline.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { formatDate, formatDuration } from "@/utils/format";
import type { StreamDetail } from "@/hooks/use-stream-detail";

export function StreamTimeline({ detail }: { detail: StreamDetail }) {
  if (detail.streamType === "milestone") {
    return <MilestoneTimeline detail={detail} />;
  }

  return <VestingTimeline detail={detail} />;
}

function VestingTimeline({ detail }: { detail: StreamDetail }) {
  const now = Math.floor(Date.now() / 1000);
  const start = detail.startTime ?? 0;
  const end = detail.endTime ?? 0;
  const cliff = detail.cliffTime ?? 0;
  const hasCliff = detail.streamType === "cliff" && cliff > start;

  const totalSec = end - start;
  const elapsedSec = Math.max(0, now - start);
  const remainingSec = Math.max(0, end - now);
  const progress = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Timeline</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-dim">Progress</span>
          <span className="text-text">{Math.round(detail.vestedPercent)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-bg2">
          <div
            className="h-full rounded-full bg-sol transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-dim">
          <span>{formatDate(start)}</span>
          <span>{formatDate(end)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-dim">Start</p>
          <p className="text-text">{formatDate(start)}</p>
        </div>
        {hasCliff && (
          <div>
            <p className="text-dim">Cliff</p>
            <p className="text-text">{formatDate(cliff)}</p>
          </div>
        )}
        <div>
          <p className="text-dim">End</p>
          <p className="text-text">{formatDate(end)}</p>
        </div>
        <div>
          <p className="text-dim">Remaining</p>
          <p className="text-text">
            {detail.status === "active" ? formatDuration(remainingSec) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MilestoneTimeline({ detail }: { detail: StreamDetail }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Milestone</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-dim">Status</p>
          <p className="text-text">{detail.milestoneReached ? "Reached" : "Not reached"}</p>
        </div>
        <div>
          <p className="text-dim">Created</p>
          <p className="text-text">{formatDate(detail.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/stream-timeline.tsx
git commit -m "feat(web): add StreamTimeline component"
```

---

## Task 9: Web — `ClaimButton` component

**Files:**

- Create: `apps/web/app/components/streams/detail/claim-button.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import { Button } from "@/components/ui/button";
import { useWithdraw } from "@/hooks/tx/use-withdraw";
import { useAuth } from "@/lib/solana/use-auth";
import type { StreamDetail } from "@/hooks/use-stream-detail";
import type { StreamAccount } from "@solana-tdp/sdk";

export function ClaimButton({ detail }: { detail: StreamDetail }) {
  const { publicKey } = useAuth();
  const withdraw = useWithdraw();

  const claimable = detail.claimable.toNumber();
  const isActive = detail.status === "active";
  const canClaim = isActive && claimable > 0;

  if (!canClaim) return null;

  const handleClaim = () => {
    if (!publicKey) return;
    const pda = new PublicKey(detail.pda);
    const [vaultPda] = getVaultPda(pda, PROGRAM_ID);
    const recipientToken = getAssociatedTokenAddressSync(new PublicKey(detail.mint), publicKey);
    const account = detail.onChainAccount as StreamAccount;

    withdraw.mutate({
      stream: pda,
      vault: vaultPda,
      sender: account.creator,
      mint: account.mint,
      recipientToken,
      amount: claimable,
    });
  };

  return (
    <Button onClick={handleClaim} disabled={withdraw.isPending}>
      {withdraw.isPending ? "Claiming..." : `Claim ${claimable.toLocaleString()} tokens`}
    </Button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/claim-button.tsx
git commit -m "feat(web): add ClaimButton component"
```

---

## Task 10: Web — `CancelButton` component

**Files:**

- Create: `apps/web/app/components/streams/detail/cancel-button.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { CancelDialog } from "@/components/streams/cancel-dialog";
import type { StreamDetail } from "@/hooks/use-stream-detail";
import type { StreamAccount } from "@solana-tdp/sdk";

export function CancelButton({ detail }: { detail: StreamDetail }) {
  const [open, setOpen] = useState(false);

  if (detail.status !== "active") return null;

  const account = detail.onChainAccount as StreamAccount;
  const pda = new PublicKey(detail.pda);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Cancel Stream
      </Button>
      {open && <CancelDialog stream={account} pda={pda} onClose={() => setOpen(false)} />}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/cancel-button.tsx
git commit -m "feat(web): add CancelButton component"
```

---

## Task 11: Web — `TriggerMilestoneButton` component

**Files:**

- Create: `apps/web/app/components/streams/detail/trigger-milestone-button.tsx`

- [ ] **Step 1: Create the component**

Check if `useTriggerMilestone` hook exists. If not, create it following the same pattern as `useCancel`.

```tsx
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { useTriggerMilestone } from "@/hooks/tx/use-trigger-milestone";
import type { StreamDetail } from "@/hooks/use-stream-detail";

export function TriggerMilestoneButton({ detail }: { detail: StreamDetail }) {
  const triggerMilestone = useTriggerMilestone();

  if (detail.streamType !== "milestone") return null;
  if (detail.milestoneReached) return null;
  if (detail.status !== "active") return null;

  const pda = new PublicKey(detail.pda);

  return (
    <Button
      onClick={() => triggerMilestone.mutate({ stream: pda })}
      disabled={triggerMilestone.isPending}
    >
      {triggerMilestone.isPending ? "Triggering..." : "Mark Milestone Reached"}
    </Button>
  );
}
```

- [ ] **Step 2: Create `useTriggerMilestone` hook if it doesn't exist**

Check `apps/web/app/hooks/tx/use-trigger-milestone.ts`. If missing, create following `useCancel` pattern:

```ts
import type { PublicKey } from "@solana/web3.js";
import { useConnection } from "@/lib/solana/use-connection";
import { useAuth } from "@/lib/solana/use-auth";
import { useSolanaTransaction } from "@/lib/solana/use-solana-transaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRecordStreamEvent } from "../use-api";
import { buildReadProgram, getTriggerMilestoneAccounts } from "./shared";

export function useTriggerMilestone() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { wallet, sendInstructions } = useSolanaTransaction();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (input: { stream: PublicKey }) => {
      if (!publicKey || !wallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(publicKey, input.stream))
        .instruction();

      const { signature } = await sendInstructions(connection, publicKey, [instruction]);
      return { tx: signature, stream: input.stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["stream", result.stream.toBase58()] });
      await queryClient.invalidateQueries({ queryKey: ["streams"] });
      if (publicKey) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "milestone_triggered",
          actorAddress: publicKey.toBase58(),
          txSignature: result.tx,
          blockTime: Math.floor(Date.now() / 1000),
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}
```

Also check if `getTriggerMilestoneAccounts` exists in `shared.ts`. If not, add it.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/streams/detail/trigger-milestone-button.tsx
git add apps/web/app/hooks/tx/use-trigger-milestone.ts
git commit -m "feat(web): add TriggerMilestoneButton and useTriggerMilestone hook"
```

---

## Task 12: Web — `StreamEventItem` component

**Files:**

- Create: `apps/web/app/components/streams/detail/stream-event-item.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { formatAddress } from "@solana-tdp-sdk";
import { formatDate, formatSol } from "@/utils/format";
import type { StreamEventRecord } from "@/hooks/use-stream-events";

const eventLabels: Record<StreamEventRecord["eventType"], string> = {
  created: "Created",
  withdrawn: "Tokens Claimed",
  milestone_triggered: "Milestone Reached",
  completed: "Completed",
  cancelled: "Cancelled",
};

const eventColors: Record<StreamEventRecord["eventType"], string> = {
  created: "text-dim",
  withdrawn: "text-blue-400",
  milestone_triggered: "text-purple-400",
  completed: "text-green-400",
  cancelled: "text-red-400",
};

export function StreamEventItem({ event }: { event: StreamEventRecord }) {
  const explorerUrl = `https://explorer.solana.com/tx/${event.txSignature}?cluster=devnet`;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-border2" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${eventColors[event.eventType]}`}>
            {eventLabels[event.eventType]}
          </span>
          {event.amount && (
            <span className="text-xs text-dim">{formatSol(Number(event.amount), 6)} tokens</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-dim">
          <span>{formatAddress(event.actorAddress)}</span>
          <span>·</span>
          <span>{formatDate(event.blockTime)}</span>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text"
          >
            TX
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/stream-event-item.tsx
git commit -m "feat(web): add StreamEventItem component"
```

---

## Task 13: Web — `StreamEventList` component

**Files:**

- Create: `apps/web/app/components/streams/detail/stream-event-list.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useStreamEvents } from "@/hooks/use-stream-events";
import { StreamEventItem } from "./stream-event-item";

export function StreamEventList({ pda }: { pda: string }) {
  const { data, isLoading, isError } = useStreamEvents(pda);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text">Event History</h3>
        <p className="text-sm text-dim">Loading events...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text">Event History</h3>
        <p className="text-sm text-dim">Failed to load events</p>
      </div>
    );
  }

  const events = data.events ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Event History</h3>
      {events.length === 0 ? (
        <p className="text-sm text-dim">No events recorded</p>
      ) : (
        <div className="divide-y divide-border">
          {events.map((event) => (
            <StreamEventItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/streams/detail/stream-event-list.tsx
git commit -m "feat(web): add StreamEventList component"
```

---

## Task 14: Web — `StreamDetailGrid` and `StreamDetailLayout`

**Files:**

- Create: `apps/web/app/components/streams/detail/stream-detail-grid.tsx`
- Create: `apps/web/app/components/streams/detail/stream-detail-layout.tsx`

- [ ] **Step 1: Create StreamDetailGrid**

```tsx
import type { ReactNode } from "react";

export function StreamDetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>;
}
```

- [ ] **Step 2: Create StreamDetailLayout**

```tsx
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { StreamStatusBadge } from "./stream-status-badge";
import type { StreamType, StreamStatus } from "@/hooks/use-stream-detail";

const typeLabels: Record<StreamType, string> = {
  linear: "Linear Stream",
  cliff: "Cliff Stream",
  milestone: "Milestone Stream",
};

export function StreamDetailLayout({
  streamType,
  status,
  children,
}: {
  streamType: StreamType;
  status: StreamStatus;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/dashboard" className="text-sm text-dim hover:text-text">
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-text">{typeLabels[streamType]}</h1>
          <StreamStatusBadge status={status} />
        </div>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/streams/detail/stream-detail-grid.tsx
git add apps/web/app/components/streams/detail/stream-detail-layout.tsx
git commit -m "feat(web): add StreamDetailLayout and StreamDetailGrid"
```

---

## Task 15: Web — Route file `app.streams.$streamPda.tsx`

**Files:**

- Create: `apps/web/app/routes/app.streams.$streamPda.tsx`

- [ ] **Step 1: Create the route**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/solana/use-auth";
import { useStreamDetail } from "@/hooks/use-stream-detail";
import { useStreamRole } from "@/hooks/use-stream-role";
import { StreamDetailLayout } from "@/components/streams/detail/stream-detail-layout";
import { StreamDetailGrid } from "@/components/streams/detail/stream-detail-grid";
import { StreamAddresses } from "@/components/streams/detail/stream-addresses";
import { StreamAmounts } from "@/components/streams/detail/stream-amounts";
import { StreamTimeline } from "@/components/streams/detail/stream-timeline";
import { StreamEventList } from "@/components/streams/detail/stream-event-list";
import { ClaimButton } from "@/components/streams/detail/claim-button";
import { CancelButton } from "@/components/streams/detail/cancel-button";
import { TriggerMilestoneButton } from "@/components/streams/detail/trigger-milestone-button";

export const Route = createFileRoute("/app/streams/$streamPda")({
  component: StreamDetailPage,
});

function StreamDetailPage() {
  const { streamPda } = Route.useParams();
  const { publicKey } = useAuth();
  const { detail, isLoading, isError, error } = useStreamDetail(streamPda);
  const role = useStreamRole(detail, publicKey?.toBase58());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dim">Loading stream...</p>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-medium text-text">Stream not found</p>
        <p className="text-sm text-dim">
          {error instanceof Error ? error.message : "The stream could not be loaded"}
        </p>
      </div>
    );
  }

  return (
    <StreamDetailLayout streamType={detail.streamType} status={detail.status}>
      <StreamDetailGrid>
        <StreamAddresses detail={detail} />
        <StreamAmounts detail={detail} />
        <StreamTimeline detail={detail} />

        {role === "recipient" && <ClaimButton detail={detail} />}
        {role === "creator" && detail.status === "active" && <CancelButton detail={detail} />}
        {role === "creator" && detail.streamType === "milestone" && (
          <TriggerMilestoneButton detail={detail} />
        )}
      </StreamDetailGrid>

      <StreamEventList pda={streamPda} />
    </StreamDetailLayout>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd apps/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Lint**

Run: `cd apps/web && npx oxlint --fix .`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/routes/app.streams.\$streamPda.tsx
git commit -m "feat(web): add stream detail page route"
```

---

## Task 16: Web — Link stream cards to detail page

**Files:**

- Modify: `apps/web/app/components/streams/stream-card/stream-card.tsx`
- Modify: `apps/web/app/components/streams/stream-list/milestone-stream-card.tsx`

- [ ] **Step 1: Add Link to StreamCard**

Wrap the card content in a `Link` to `/app/streams/$streamPda`:

```tsx
import { Link } from "@tanstack/react-router";

// In the return, wrap the outer div:
<Link to="/app/streams/$streamPda" params={{ streamPda: pda.toBase58() }} className="block">
  <div className="rounded-xl border border-border bg-bg1 px-5 py-4 transition-colors hover:border-border2">
    {/* existing content */}
  </div>
</Link>;
```

- [ ] **Step 2: Add Link to MilestoneStreamCard**

Same pattern — wrap in Link to detail page.

- [ ] **Step 3: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx oxlint --fix .`

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/components/streams/stream-card/stream-card.tsx
git add apps/web/app/components/streams/stream-list/milestone-stream-card.tsx
git commit -m "feat(web): link stream cards to detail page"
```

---

## Task 17: Final verification

- [ ] **Step 1: Full typecheck**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 2: Full lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 3: Run dev server and test manually**

Run: `pnpm dev`

- Navigate to dashboard
- Click a stream card → should navigate to `/app/streams/:pda`
- Verify detail page loads with addresses, amounts, timeline, events
- Verify role detection (creator sees cancel, recipient sees claim)

- [ ] **Step 4: Final commit if needed**
