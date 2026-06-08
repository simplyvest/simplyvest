# Token Creator + Token List

**Date:** 2026-06-08
**Status:** Design approved, pending implementation

## Overview

Two new pages under `/tools/`:

1. **Token Creator** (`/tools/create-token`) — Create SPL tokens with full Metaplex metadata
2. **Token List** (`/tools/tokens`) — View wallet tokens, filter by "Created with SimplyVest" vs "External"

No Anchor program changes. Everything is standard SPL Token + Metaplex instructions composed at the SDK level.

## Architecture

```
Token Creation Flow:
  Web UI form
    ├─→ POST /api/tokens/upload-image   ──→ R2 (image stored)
    ├─→ POST /api/tokens/metadata       ──→ R2 (JSON metadata)
    ├─→ SDK: createTokenInstructions()  ──→ Solana tx (4 instructions)
    └─→ POST /api/tokens                ──→ D1 : token_creations (record)

Token List:
  useOwnedTokens()                      ──→ chain (wallet token accounts)
  GET /api/tokens?creator=<address>     ──→ D1 : token_creations (enrichment)
  Merge → table with created/external badges

Metadata Reading:
  SDK: fetchDigitalAsset() via UMI      ──→ chain (Metaplex Metadata PDA)
  Replaces broken manual Borsh deserialization
```

## Technology Decisions

### Metaplex UMI for Reading + Writing

We replace manual Borsh deserialization (`fetchTokenMetadata`) with UMI's `fetchDigitalAsset`. This handles:

- PDA derivation correctly
- Binary deserialization of all metadata versions
- Returns `{name, symbol, uri}` (adds `uri` to existing return type)

SDK deps to add:

- `@metaplex-foundation/umi`
- `@metaplex-foundation/umi-bundle-defaults`
- `@metaplex-foundation/mpl-token-metadata`

Trade-off: ~100KB+ SDK bundle increase. Acceptable — this is Solana tooling, not a landing page.

### No Anchor Changes

All instructions are standard SPL Token Program + Metaplex Token Metadata Program:

1. `createInitializeMintInstruction` (SPL Token)
2. `createAssociatedTokenAccountInstruction` (ATA for creator)
3. `createMintToInstruction` (mint initial supply)
4. `createCreateMetadataAccountV3Instruction` (Metaplex: name + symbol + URI)

Composed in a single transaction via SDK helper.

## D1 Schema

```sql
CREATE TABLE token_creations (
  mint_address TEXT PRIMARY KEY,
  creator_address TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 9,
  supply TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_token_creations_creator ON token_creations(creator_address);
```

## API Endpoints

### `POST /api/tokens/upload-image`

- Multipart form, max 2MB
- Accepted: PNG, JPEG, SVG, WEBP
- Stores to R2: `tokens/<uuid>.<ext>`
- Returns: `{ url: string }`

### `POST /api/tokens/metadata`

- JSON body: `{ name: string, symbol: string, imageUrl: string }`
- Creates Metaplex-compatible JSON
- Stores to R2: `tokens/<uuid>.json`
- Returns: `{ uri: string }`

### `POST /api/tokens`

- JSON body: `{ mintAddress, creatorAddress, name, symbol, decimals, supply, metadataUri }`
- Records creation in D1
- Returns: `{ success: true }`

### `GET /api/tokens?creator=<address>`

- Returns list of mints created by this address via SimplyVest
- Used by frontend to tag tokens as "Created here"

## SDK

### `packages/solana-tdp-sdk/src/token.ts` (new)

```ts
type CreateTokenParams = {
  payer: PublicKey;
  mint: Keypair;
  decimals: number; // 0-9
  amount: number | bigint;
  metadataUri: string;
  name: string;
  symbol: string;
};

function createTokenInstructions(params: CreateTokenParams): TransactionInstruction[];
```

Returns all 4 instructions for a single transaction.

### `packages/solana-tdp-sdk/src/metadata.ts` (rewritten)

Replace manual Borsh with UMI:

```ts
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";

interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string; // NEW
}

async function fetchTokenMetadata(
  connection: Connection,
  mint: PublicKey,
): Promise<TokenMetadata | null>;
```

Uses `createUmi(connection.rpcEndpoint)` internally. Returns null if no metadata PDA exists.

Existing consumers (`formatTokenLabel`, `TokenSelector`, stream detail) are backward-compatible — `uri` is additive.

## Frontend

### Routes

| Route                 | Component                    |
| --------------------- | ---------------------------- |
| `/tools/tokens`       | Token list page              |
| `/tools/create-token` | Token creator form + success |

### Token List Page (`/tools/tokens`)

**States:**

- Loading: skeleton rows
- Empty (no tokens at all): "No tokens found in your wallet"
- Empty (Created Here filter, none found): "You haven't created any tokens yet" + CTA button → `/tools/create-token`
- Empty (External filter, none found): "All your tokens were created with SimplyVest"
- Error: retry button
- Data: token table with filter tabs

**Table columns:** Icon (from metadata URI), Name, Symbol, Balance, Badge (Created Here / External)

**Filter tabs:** All | Created Here | External

**Row click:** navigates to `/create?mint=<address>` — pre-fills the create-stream form with the selected token

### Token Creator Form (`/tools/create-token`)

**Fields:**

- Token Name (text, required)
- Symbol (text, max 10 chars, required)
- Decimals (number, 0-9, default 9)
- Icon (file upload, optional, PNG/JPEG/SVG/WEBP, max 2MB)
- Initial Supply (number, required, > 0)

**Flow:**

1. User fills form → clicks "Create Token"
2. Icon uploaded → API returns URL
3. Metadata JSON posted → API returns URI
4. Transaction built via `createTokenInstructions()` → sent via wallet
5. On success → POST `/api/tokens` to record → show success page

**Success page:** mint address (with copy), explorer link, "View My Tokens" → `/tools/tokens`, "Create Stream" → `/create?mint=<address>` (pre-fills token selector)

**Error handling:**

- Upload failure → toast, retryable
- Transaction rejected → no-op, form stays
- API error → toast with message
- R2 outage → 503, retry button

### Hooks

- `useCreateToken()` — React Query mutation wrapping the 3-step flow
- `useTokenList()` — combines `useOwnedTokens()` + `GET /api/tokens?creator=<address>` enrichment

## Files Checklist

| Layer     | File                                                      | Action                              |
| --------- | --------------------------------------------------------- | ----------------------------------- |
| SDK       | `packages/solana-tdp-sdk/package.json`                    | Add 3 metaplex deps                 |
| SDK       | `packages/solana-tdp-sdk/src/metadata.ts`                 | Rewrite with UMI                    |
| SDK       | `packages/solana-tdp-sdk/src/token.ts`                    | New: `createTokenInstructions()`    |
| SDK       | `packages/solana-tdp-sdk/src/index.ts`                    | Export new `token.ts`               |
| API       | `apps/api/src/db/schema.ts`                               | Add `token_creations` migration     |
| API       | `apps/api/src/routes/tokens.ts`                           | New: 4 endpoints                    |
| API       | `apps/api/src/services/token-upload.ts`                   | New: R2 upload logic                |
| Web       | `apps/web/app/routes/tools.tokens.tsx`                    | New: token list page                |
| Web       | `apps/web/app/routes/tools.create-token.tsx`              | New: create form page               |
| Web       | `apps/web/app/components/tools/token-list.tsx`            | New: table + filters                |
| Web       | `apps/web/app/components/tools/token-creator-form.tsx`    | New: form                           |
| Web       | `apps/web/app/components/tools/token-creator-success.tsx` | New: success                        |
| Web       | `apps/web/app/hooks/use-create-token.ts`                  | New: mutation hook                  |
| Web       | `apps/web/app/hooks/use-token-list.ts`                    | New: data hook                      |
| Storybook | `apps/web/app/components/tools/*.stories.tsx`             | Stories for all new components      |
| Tests     | `packages/solana-tdp-sdk/src/token.test.ts`               | Tests for `createTokenInstructions` |
| Tests     | `packages/solana-tdp-sdk/src/metadata.test.ts`            | Update for UMI approach             |
| Tests     | `apps/api/src/services/token-upload.test.ts`              | Upload logic tests                  |
| Tests     | `apps/api/src/routes/tokens.test.ts`                      | Endpoint tests                      |

## Out of Scope

- Token-2022 extensions (transfer-hook, metadata-pointer, etc.)
- Batch vesting / token dispenser (separate feature)
- Token management (mint more, freeze, transfer authority)
- NFT creation (0 decimals allowed but no NFT-specific features)
- Post-creation token editing
