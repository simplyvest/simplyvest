# Stream Detail Page — Design Spec

**Date:** 2026-06-08
**Status:** Approved
**Route:** `/app/streams/:streamPda`

## Overview

A dedicated stream detail page showing real-time vesting state and event history. The page adapts its content based on the viewer's role (creator vs recipient) — same route, different views.

## Goals

- Single route at `/app/streams/:streamPda` with role-based rendering
- Hybrid data: API for metadata + events, on-chain for real-time state
- Small, composable, reusable components (no large components)
- Handle all three stream types: linear, cliff, milestone
- Fix API data gaps (amountWithdrawn, milestoneReached, cancelled status)

## Route

```
/app/streams/:streamPda
```

- `streamPda` — base58 public key of the stream account
- Route file: `apps/web/app/routes/app.streams.$streamPda.tsx`

## Data Architecture

### Data Sources

| Source       | Responsibility                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **API**      | Stream metadata (PDA, creator, recipient, mint, amounts, timestamps, type, org) + event history |
| **On-chain** | Real-time state (amountWithdrawn, vesting %, cancelled, milestoneReached)                       |

### API Data Fixes

Currently, events are recorded but stream fields aren't updated. Fix:

| Event                 | Should Update                                    |
| --------------------- | ------------------------------------------------ |
| `withdrawn`           | `amountWithdrawn` = previous + withdrawal amount |
| `milestone_triggered` | `milestoneReached` = true                        |
| `cancelled`           | `status` = "cancelled"                           |
| `completed`           | `status` = "completed" (already works)           |

**Implementation:** The `POST /:id/events` endpoint should also PATCH the stream row with updated fields when recording events.

**Reconciler enhancement:**

- Currently only checks account existence
- Should deserialize on-chain account data and sync `amountWithdrawn`, `milestoneReached`, `cancelled` status
- Acts as safety net if frontend fails to record

### Stream Type Detection

From API `type` field + `cliffTime`:

- `"time"` + `cliffTime > startTime` → cliff stream
- `"time"` + `cliffTime <= startTime` → linear stream
- `"milestone"` → milestone stream

### Merged Data Shape

```ts
interface StreamDetail {
  // From API
  pda: string;
  type: "time" | "milestone";
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
  orgId?: string;
  events: StreamEvent[];

  // From on-chain (overrides API stale values)
  amountWithdrawn: string;
  cancelled: boolean;
  milestoneReached: boolean;

  // Computed
  streamType: "linear" | "cliff" | "milestone";
  status: "active" | "completed" | "cancelled";
  claimable: string;
  vestedPercent: number;
}
```

### Hooks

| Hook                            | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `useStreamDetail(pda)`          | Orchestrates API + on-chain fetch, returns merged `StreamDetail` |
| `useStreamRole(detail, wallet)` | Returns `"creator" \| "recipient" \| "unknown"`                  |
| `useStreamEvents(pda)`          | Fetches event history from API                                   |

### Fetch Flow

```
1. Get streamPda from URL params
2. Fetch stream from API (by PDA) → get type, metadata
3. Fetch on-chain state:
   - if type === "milestone" → fetchMilestoneStream()
   - else → fetchStream() (handles both linear + cliff)
4. Merge: API metadata + on-chain real-time state
5. Detect role: wallet === creator → "creator", wallet === recipient → "recipient"
6. Render StreamDetailLayout with merged data
```

## Component Architecture

### Component Tree

```
app.streams.$streamPda.tsx (orchestrator)
├── StreamDetailLayout
│   ├── BackButton
│   ├── StreamStatusBadge
│   └── StreamDetailGrid
│       ├── StreamAddresses
│       ├── StreamAmounts
│       ├── StreamTimeline
│       └── [role-specific actions]
│           ├── ClaimButton (recipient)
│           ├── CancelButton (creator)
│           └── TriggerMilestoneButton (creator)
└── StreamEventList
    └── StreamEventItem[]
```

### Component Responsibilities

**Route (`app.streams.$streamPda.tsx`):**

- Thin orchestrator
- Calls `useStreamDetail(pda)` and `useStreamRole(detail, wallet)`
- Passes data down to layout components
- No UI logic beyond composition

**`StreamDetailLayout`:**

- Page shell: back button, title (stream type label), status badge
- Wraps content in `StreamDetailGrid`

**`StreamDetailGrid`:**

- 2-column responsive grid
- Children: info sections + action area

**`StreamAddresses` (reusable, role-agnostic):**

- Displays: PDA, creator, recipient, mint, vault
- Each with copy button + Solana Explorer link
- Receives addresses as props

**`StreamAmounts` (reusable, role-agnostic):**

- Displays: total amount, withdrawn, claimable
- Token-aware formatting (decimals, symbol)
- Receives amounts + mint info as props

**`StreamTimeline` (reusable, role-agnostic):**

- Displays: start time, cliff time (if cliff), end time
- Progress bar showing vesting %
- For milestone: shows milestone status instead of timeline
- Receives timestamps + progress as props

**`StreamStatusBadge`:**

- Active (green), Completed (gray), Cancelled (red)
- Receives status string as props

**`ClaimButton` (recipient only):**

- Triggers `useClaim()` mutation
- Disabled if nothing to claim
- Shows claimable amount
- Receives claimable amount + stream PDA as props

**`CancelButton` (creator only):**

- Triggers `useCancel()` mutation
- Confirmation dialog (reuse existing `cancel-dialog.tsx`)
- Receives stream PDA as props

**`TriggerMilestoneButton` (creator only, milestone streams):**

- Triggers `useTriggerMilestone()` mutation
- Only shown if milestone not yet reached
- Receives stream PDA + milestoneReached as props

**`StreamEventList`:**

- Fetches events via `useStreamEvents(pda)`
- Renders list of `StreamEventItem`
- Only component that does its own data fetching

**`StreamEventItem`:**

- Single event row: type icon, actor address, amount, tx link, timestamp
- Receives event object as props

### File Structure

```
apps/web/app/
├── routes/
│   └── app.streams.$streamPda.tsx
├── components/
│   └── streams/
│       └── detail/
│           ├── stream-detail-layout.tsx
│           ├── stream-detail-grid.tsx
│           ├── stream-addresses.tsx
│           ├── stream-amounts.tsx
│           ├── stream-timeline.tsx
│           ├── stream-status-badge.tsx
│           ├── claim-button.tsx
│           ├── cancel-button.tsx
│           ├── trigger-milestone-button.tsx
│           ├── stream-event-list.tsx
│           └── stream-event-item.tsx
├── hooks/
│   ├── use-stream-detail.ts
│   ├── use-stream-role.ts
│   └── use-stream-events.ts
```

## Role-Based Behavior

| Element                | Creator                         | Recipient | Unknown |
| ---------------------- | ------------------------------- | --------- | ------- |
| StreamAddresses        | ✅                              | ✅        | ✅      |
| StreamAmounts          | ✅                              | ✅        | ✅      |
| StreamTimeline         | ✅                              | ✅        | ✅      |
| StreamStatusBadge      | ✅                              | ✅        | ✅      |
| StreamEventList        | ✅                              | ✅        | ✅      |
| ClaimButton            | ❌                              | ✅        | ❌      |
| CancelButton           | ✅ (if active)                  | ❌        | ❌      |
| TriggerMilestoneButton | ✅ (if milestone + not reached) | ❌        | ❌      |

## Stream Type Variations

| Element                | Linear         | Cliff                        | Milestone              |
| ---------------------- | -------------- | ---------------------------- | ---------------------- |
| Timeline               | start → end    | start → cliff → end          | N/A                    |
| Progress bar           | Continuous     | Stepped (cliff jump)         | Binary (reached/not)   |
| Claimable calc         | Linear formula | 0 before cliff, linear after | Full amount if reached |
| TriggerMilestoneButton | ❌             | ❌                           | ✅ (creator)           |

## Navigation

- Back button → `/app/dashboard` (or previous page)
- Stream cards in dashboard list link to `/app/streams/:streamPda`
- URL is shareable (public page, role detection happens client-side)

## Error Handling

- Stream not found → 404 page with "Stream not found" message
- On-chain fetch failure → Show API data with "Live data unavailable" warning
- API fetch failure → Show on-chain data only, no event history
- Both fail → Error state with retry button
