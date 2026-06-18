# Org Tokenized Equity — Design Spec

## Problem

Organizations have no concept of an equity token. Users can create tokens and vest streams independently, but there's no way to say "this org's equity token is X" and then vest that token to org members from a central dashboard.

## Goal

Attach one SPL token to an organization as its equity token. Show a dashboard on the org detail page with token info, vesting stats, and activity. Allow the owner to create a new token or link an existing one, then vest it to members using the existing stream infrastructure.

## Decisions

| Decision           | Choice                                           | Rationale                                                                     |
| ------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Token per org      | One token per org (single FK on `organizations`) | Simpler than join table; "one org = one equity" maps naturally                |
| Permissions        | Owner only                                       | Token management = equity control; admins manage members only                 |
| Supply model       | Fixed at creation                                | Matches traditional equity; no dilution                                       |
| Vesting terms      | Per-member custom or org-wide standard           | Owner chooses when vesting                                                    |
| Stream integration | Reuses existing streams                          | No new on-chain program; streams already have `orgId` and `mintAddress`       |
| Token linking      | `TokenPickerDialog` + mint address input         | Reuses existing component; supports both platform-created and external tokens |

## Schema Changes

Add four nullable columns to `organizations`:

```sql
ALTER TABLE organizations ADD COLUMN mint_address TEXT;
ALTER TABLE organizations ADD COLUMN token_name TEXT;
ALTER TABLE organizations ADD COLUMN token_symbol TEXT;
ALTER TABLE organizations ADD COLUMN token_decimals INTEGER DEFAULT 9;
```

Drizzle schema addition to `organizations`:

```ts
mintAddress: text("mint_address"),
tokenName: text("token_name"),
tokenSymbol: text("token_symbol"),
tokenDecimals: integer("token_decimals"),
```

All nullable — existing orgs remain valid with `mint_address = NULL` (no token attached).

No new tables. No changes to `streams` or `token_creations`.

## API Changes

### `PUT /api/orgs/:id/token`

Link or set the org token. Owner only.

**Request body (link existing):**

```json
{
  "action": "link",
  "mintAddress": "...",
  "tokenName": "ACME Equity",
  "tokenSymbol": "ACME",
  "tokenDecimals": 9
}
```

**Request body (create new via platform):**

```json
{
  "action": "create",
  "name": "ACME Equity",
  "symbol": "ACME",
  "decimals": 9,
  "amount": "1000000"
}
```

The `create` action internally calls `createPlatformToken()` (reuses existing service), then records the token via `recordToken()`, then links it to the org.

**Response:** Updated org object with token fields.

**Errors:**

- 403: not owner
- 409: org already has a token (must `DELETE` first)
- 500: platform token creation failed

### `DELETE /api/orgs/:id/token`

Unlink the org token. Owner only. Does NOT delete the on-chain token — just removes the association.

**Response:** `{ ok: true }`

**Errors:**

- 403: not owner
- 404: org has no token

### `GET /api/orgs/:id`

Already exists. Response will now include the four new token fields (`mintAddress`, `tokenName`, `tokenSymbol`, `tokenDecimals`) when a token is linked.

### Stream stats endpoint

No new endpoint needed. The frontend will use the existing `GET /api/streams?org=<orgId>` to compute stats client-side (total vested, total claimed, active count).

## Frontend Components

### `OrgDashboard`

New component. Wraps `OrgTokenCard`, `OrgTokenStats`, and `OrgVestList`. Placed at the top of `OrgDetail`, between the org header and the members section.

### `OrgTokenCard`

Renders at the top of the org dashboard. Two states:

**No token attached (owner view):**

- Dashed placeholder card
- "Create Token" button (opens `CreateOrgTokenModal`)
- "Link Existing" button (opens `LinkOrgTokenModal`)

**No token attached (non-owner view):**

- Dashed placeholder: "This organization has no equity token yet"
- No action buttons

**Token attached (all views):**

- Token icon (first letter of name), name, symbol, mint address (truncated), total supply
- Owner sees: "Vest to Member" button (opens `VestToMemberModal`), "Change" dropdown (link different token)
- Non-owner sees: token info only (no actions)

### `OrgTokenStats`

Three stat cards in a row:

- **Active Vests**: count of streams with `status=active` for this org
- **Total Vested**: sum of `amount` across all org streams
- **Total Claimed**: sum of `amountWithdrawn` across all org streams

Data source: `useApiStreams({ org: orgId })` — existing hook, no new API.

### `OrgVestList`

Table of vesting streams for this org. Columns: recipient, amount, progress bar, status. Each row links to the stream detail page.

Data source: same `useApiStreams({ org: orgId })` query.

### `CreateOrgTokenModal`

Modal with a simplified form:

- Name (text input)
- Symbol (text input)
- Decimals (number input, default 9)
- Amount (text input — total supply)
- Image (optional file upload)

On submit:

1. Uploads image (if provided) via existing `/api/tokens/upload-image`
2. Calls `PUT /api/orgs/:id/token` with `action: create`
3. Invalidates `["org", orgId]` query

Reuses `useCreatePlatformToken` hook pattern but calls the new org-specific endpoint instead of the generic token creation endpoint.

### `LinkOrgTokenModal`

Wraps `TokenPickerDialog` (existing component at `apps/web/app/components/tokens/token-selector/token-picker-dialog.tsx`). When a token is selected:

1. Calls `PUT /api/orgs/:id/token` with `action: link` and the selected token's mint/name/symbol/decimals
2. Invalidates `["org", orgId]` query

The `TokenPickerDialog` already handles: wallet tokens, platform-created tokens, common tokens, and pasting a custom mint address.

### `VestToMemberModal`

Modal opened from "Vest to Member" button on `OrgTokenCard`. Simplified stream creation form:

- Recipient (text input — wallet address or userId)
- Amount (number input)
- Duration (select: 1yr, 2yr, 3yr, 4yr — or custom)
- Cliff (optional — 0, 3mo, 6mo, 1yr)
- Type (select: linear, cliff)

Pre-fills:

- `mintAddress` = org's `mintAddress`
- `orgId` = current org ID

On submit:

1. Builds the stream creation transaction using existing SDK (`createTokenInstructions` is NOT used here — the token already exists; the stream creation uses the Anchor program)
2. Records the stream via `POST /api/streams` with `orgId` set
3. Invalidates `["api-streams", { org: orgId }]` query

**Note:** This modal needs to invoke the Anchor program to create the on-chain vesting stream, same as the existing `CreateLinearForm` / `CreateCliffForm`. It should reuse the same hooks (`useSolanaTransaction`, etc.) but with a simplified UI.

## Data Flow

```
Owner opens org detail page
  → GET /api/orgs/:id (includes token fields + members)
  → GET /api/streams?org=<orgId> (for stats + vest list)

Owner clicks "Create Token"
  → CreateOrgTokenModal opens
  → PUT /api/orgs/:id/token { action: "create" }
  → API calls createPlatformToken() → recordToken() → updates org
  → Query invalidated, page re-renders with token card

Owner clicks "Link Existing"
  → LinkOrgTokenModal opens with TokenPickerDialog
  → Owner selects token
  → PUT /api/orgs/:id/token { action: "link", mintAddress, ... }
  → Query invalidated, page re-renders

Owner clicks "Vest to Member"
  → VestToMemberModal opens with org token pre-filled
  → Owner enters recipient, amount, duration
  → Transaction built, signed, sent to Anchor program
  → POST /api/streams { ..., orgId, mintAddress: org.mintAddress }
  → Query invalidated, vest list updates
```

## Edge Cases

1. **Org has streams but no token set:** Streams still work (they have their own `mintAddress`). Org page shows "No token attached" placeholder. Owner can link the matching token to associate them.

2. **Owner tries to create token when one already exists:** API returns 409. Frontend disables "Create" button when `org.mintAddress` is set, and shows "Change" option instead.

3. **Owner links wrong token:** Can `DELETE` the token link and re-link. Streams already created with the old mint are unaffected — they have their own `mintAddress`.

4. **Non-owner visits org page:** Sees token info card and dashboard stats. No action buttons.

5. **Token decimals mismatch with streams:** Each stream stores its own `tokenDecimals`. The org token's decimals are for display purposes on the dashboard; stream math uses the per-stream value.

## File Changes Summary

### API (`apps/api/src/`)

- `db/schema.ts` — add 4 columns to `organizations`
- `db/migrations/` — new migration for the 4 columns
- `services/org-service.ts` — add `setOrgToken()`, `removeOrgToken()` methods
- `routes/organizations.ts` — add `PUT /:id/token` and `DELETE /:id/token` endpoints

### Web (`apps/web/app/`)

- `components/orgs/org-detail.tsx` — insert `OrgDashboard` above members section
- `components/orgs/org-dashboard.tsx` — new, composes token card + stats + vest list
- `components/orgs/org-token-card.tsx` — new, token info or placeholder
- `components/orgs/org-token-stats.tsx` — new, three stat cards
- `components/orgs/org-vest-list.tsx` — new, stream table for org
- `components/orgs/create-org-token-modal.tsx` — new, token creation form
- `components/orgs/link-org-token-modal.tsx` — new, wraps TokenPickerDialog
- `components/orgs/vest-to-member-modal.tsx` — new, simplified stream creation
- `hooks/use-api.ts` — add `useUpdateOrgToken()`, `useRemoveOrgToken()` hooks; extend `Organization` interface with token fields

### No changes needed

- `packages/solana-tdp-sdk/` — no changes
- `apps/solana-tdp-anchor/` — no changes
- `apps/api/src/services/token-service.ts` — reused as-is
- `apps/api/src/services/stream-service.ts` — reused as-is
- `apps/web/app/components/tokens/token-selector/` — reused as-is
