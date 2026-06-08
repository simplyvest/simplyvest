# API-First Dashboard with On-Demand Sync

## Problem

Dashboard currently fetches streams from on-chain only. When streams are fully withdrawn or cancelled, the on-chain accounts are closed and historical data is lost.

## Solution

API-first approach: always fetch from DB, periodically sync on-chain state for active streams.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  Dashboard → useApiStreams() → GET /api/streams?creator=X   │
│       │                                                      │
│       ├─ Active streams → useStreamSync() → POST /api/...   │
│       │   (background, throttled by staleTime)               │
│       │                                                      │
│       └─ Stream Detail → useStreamDetail(id)                 │
│           ├─ GET /api/streams/:id (historical + metadata)    │
│           └─ POST /api/streams/:id/sync (if stale)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        API (Hono)                            │
├─────────────────────────────────────────────────────────────┤
│  GET  /api/streams          → list from DB (filters)         │
│  GET  /api/streams/:id      → get stream + events from DB    │
│  POST /api/streams/:id/sync → fetch on-chain, update DB      │
│                               (skip if lastSyncedAt < 60s)   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      D1 Database                             │
├─────────────────────────────────────────────────────────────┤
│  streams: +tokenName, tokenSymbol, tokenDecimals             │
│           +creatorDisplayName, description                   │
│           +lastSyncedAt (throttle control)                   │
│  stream_events: unchanged                                    │
└─────────────────────────────────────────────────────────────┘
```

## DB Schema Changes

Add to `streams` table:

```typescript
tokenName: text("token_name"),
tokenSymbol: text("token_symbol"),
tokenDecimals: integer("token_decimals"),
creatorDisplayName: text("creator_display_name"),
description: text("description"),
```

Migration: `apps/api/src/db/migrations/0002_add_stream_metadata.sql`

## API Changes

### Stream Creation (`POST /api/streams`)

Accept new optional fields:

- `tokenName?: string`
- `tokenSymbol?: string`
- `tokenDecimals?: number`
- `creatorDisplayName?: string`
- `description?: string`

Populate `creatorDisplayName` from `users` table if not provided.

### Sync Endpoint (`POST /api/streams/:id/sync`)

```
1. Get stream from DB
2. Check lastSyncedAt - return early if < 60s
3. Fetch on-chain account (time or milestone)
4. If account closed (not found on-chain):
   - If status === "active" → set status = "completed"
   - Update lastSyncedAt
5. If account exists:
   - Update amountWithdrawn, milestoneReached
   - Recompute status based on endTime/amountWithdrawn
   - Update lastSyncedAt
6. Return updated stream
```

### List Endpoint (`GET /api/streams`)

No changes - already supports filtering by creator/recipient.

## Frontend Changes

### New Hooks

```typescript
// use-stream-sync.ts
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

### Dashboard

Replace `useStreams()` + `useMilestoneStreams()` with `useApiStreams()`.

Background sync for active streams:

```typescript
useEffect(() => {
  if (!streams) return;
  const stale = streams.filter(
    (s) => s.status === "active" && (!s.lastSyncedAt || Date.now() / 1000 - s.lastSyncedAt > 60),
  );
  stale.forEach((s) => sync.mutate(s.id));
}, [streams]);
```

### Stream Detail

Use `useApiStream(id)` + on-demand sync if stale.

### Card Components

Update `StreamCard` and `MilestoneStreamCard` to accept API type (`StreamWithEvents`) instead of on-chain types.

## Throttling Strategy

- **React Query staleTime**: 30 seconds (frontend cache)
- **DB lastSyncedAt**: 60 seconds (API-level protection)

## Data Flow

```
Create Stream:
  Frontend → POST /api/streams { ...streamData, tokenName, ... }
  API → INSERT into streams + stream_events

View Dashboard:
  Frontend → GET /api/streams?creator=X
  API → SELECT from streams (all statuses)
  Frontend → render immediately (optimistic)
  Frontend → POST /api/streams/:id/sync for active stale streams
  API → fetch on-chain → UPDATE streams
  Frontend → React Query updates UI

Withdraw/Cancel:
  Frontend → send Solana tx
  Frontend → POST /api/streams/:id/events { type: "withdrawn", ... }
  Frontend → POST /api/streams/:id/sync (update status)
```

## Files to Modify

### DB

- `apps/api/src/db/schema.ts` - Add new columns
- `apps/api/src/db/migrations/0002_add_stream_metadata.sql` - Migration

### API

- `apps/api/src/routes/streams.ts` - Add sync endpoint, update create
- `apps/api/src/services/stream-service.ts` - Add sync logic

### Frontend

- `apps/web/app/hooks/use-api.ts` - Update types, add sync hook
- `apps/web/app/hooks/use-stream-sync.ts` - New sync mutation
- `apps/web/app/routes/app.dashboard.tsx` - Use API data
- `apps/web/app/components/streams/stream-list/stream-list.tsx` - API types
- `apps/web/app/components/streams/stream-card/stream-card.tsx` - API types
- `apps/web/app/components/streams/stream-list/milestone-stream-card.tsx` - API types
- `apps/web/app/routes/app.streams.$streamPda.tsx` - Use API + sync

## Implementation Order

1. DB migration + schema update
2. API sync endpoint
3. API create endpoint (new fields)
4. Frontend hooks (useApiStreams, useStreamSync)
5. Dashboard refactor (API-first)
6. Card components update (API types)
7. Stream detail page refactor
