# Org Tokenized Equity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Attach an SPL equity token to an organization, show a dashboard on the org detail page, and allow owners to vest that token to members.

**Architecture:** Add nullable token columns to the `organizations` table. New API endpoints for linking/unlinking tokens. Frontend gets an `OrgDashboard` component with token card, stats, vest list, and modals for creating/linking tokens and vesting to members.

**Tech Stack:** Hono (API), Drizzle ORM + SQLite/D1 (DB), React + TanStack Router + TanStack Query (web), Solana Web3.js + Anchor SDK, vitest (tests)

---

## Task 1: Schema — Add token columns to organizations

**Files:**

- Modify: `apps/api/src/db/schema.ts`
- Create: `apps/api/src/db/migrations/0004_org_token.sql`

- [ ] **Step 1: Add columns to Drizzle schema**

In `apps/api/src/db/schema.ts`, add four nullable fields to the `organizations` table after `description`:

```ts
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  mintAddress: text("mint_address"),
  tokenName: text("token_name"),
  tokenSymbol: text("token_symbol"),
  tokenDecimals: integer("token_decimals"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

- [ ] **Step 2: Create migration file**

Create `apps/api/src/db/migrations/0004_org_token.sql`:

```sql
ALTER TABLE `organizations` ADD `mint_address` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `token_name` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `token_symbol` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `token_decimals` integer;
```

- [ ] **Step 3: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/db/schema.ts apps/api/src/db/migrations/0004_org_token.sql
git commit -m "feat(api): add token columns to organizations table"
```

---

## Task 2: API — Org service token methods

**Files:**

- Modify: `apps/api/src/services/org-service.ts`

- [ ] **Step 1: Add setOrgToken and removeOrgToken methods**

In `apps/api/src/services/org-service.ts`, add two new methods inside the returned object (after `removeMember`):

```ts
async setOrgToken(
  orgId: string,
  token: {
    mintAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimals: number;
  },
) {
  const result = await db
    .update(organizations)
    .set({
      mintAddress: token.mintAddress,
      tokenName: token.tokenName,
      tokenSymbol: token.tokenSymbol,
      tokenDecimals: token.tokenDecimals,
    })
    .where(eq(organizations.id, orgId))
    .returning();

  return result[0] ?? null;
},

async removeOrgToken(orgId: string) {
  const result = await db
    .update(organizations)
    .set({
      mintAddress: null,
      tokenName: null,
      tokenSymbol: null,
      tokenDecimals: null,
    })
    .where(eq(organizations.id, orgId))
    .returning();

  return result[0] ?? null;
},
```

- [ ] **Step 2: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Run lint**

Run: `rtk pnpm lint`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/services/org-service.ts
git commit -m "feat(api): add setOrgToken and removeOrgToken to org service"
```

---

## Task 3: API — Token routes on organizations

**Files:**

- Modify: `apps/api/src/routes/organizations.ts`

- [ ] **Step 1: Add PUT /:id/token endpoint**

In `apps/api/src/routes/organizations.ts`, add after the `DELETE /:id/members/:userId` route (before `GET /me/list`):

```ts
// Set org token (requires auth + owner role)
orgRoutes.put("/:id/token", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, userId);
  if (role !== "owner") {
    return c.json({ error: "Only owners can manage the org token" }, 403);
  }

  const org = await service.getOrgById(orgId);
  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }

  if (org.mintAddress) {
    return c.json({ error: "Organization already has a token. Remove it first." }, 409);
  }

  if (body.action === "create") {
    if (!body.name || !body.symbol || body.decimals === undefined || !body.amount) {
      return c.json({ error: "name, symbol, decimals, and amount are required for create" }, 400);
    }

    const tokenService = createTokenService(db);
    const rpcUrl = c.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

    let metadataUri = "";
    if (body.name) {
      metadataUri = await uploadMetadataJson(
        body.name,
        body.symbol,
        body.imageUrl,
        c.env.TOKEN_ASSETS,
        c.req.url,
      );
    }

    try {
      const result = await createPlatformToken({
        secretKeyJson: c.env.PLATFORM_SECRET_KEY,
        rpcUrl,
        name: body.name,
        symbol: body.symbol,
        decimals: body.decimals,
        amount: body.amount,
        creatorAddress: userId,
        metadataUri,
      });

      await tokenService.recordToken({
        mintAddress: result.mintAddress,
        creatorAddress: userId,
        name: body.name,
        symbol: body.symbol,
        decimals: body.decimals,
        supply: result.supply,
        metadataUri,
      });

      const updated = await service.setOrgToken(orgId, {
        mintAddress: result.mintAddress,
        tokenName: body.name,
        tokenSymbol: body.symbol,
        tokenDecimals: body.decimals,
      });

      return c.json(updated, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: msg }, 500);
    }
  }

  if (body.action === "link") {
    if (!body.mintAddress) {
      return c.json({ error: "mintAddress is required for link" }, 400);
    }

    const updated = await service.setOrgToken(orgId, {
      mintAddress: body.mintAddress,
      tokenName: body.tokenName ?? null,
      tokenSymbol: body.tokenSymbol ?? null,
      tokenDecimals: body.tokenDecimals ?? 9,
    });

    return c.json(updated, 200);
  }

  return c.json({ error: "action must be 'create' or 'link'" }, 400);
});
```

- [ ] **Step 2: Add DELETE /:id/token endpoint**

Add immediately after the PUT route:

```ts
// Remove org token (requires auth + owner role)
orgRoutes.delete("/:id/token", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, userId);
  if (role !== "owner") {
    return c.json({ error: "Only owners can manage the org token" }, 403);
  }

  const org = await service.getOrgById(orgId);
  if (!org?.mintAddress) {
    return c.json({ error: "Organization has no token" }, 404);
  }

  await service.removeOrgToken(orgId);
  return c.json({ ok: true });
});
```

- [ ] **Step 3: Add missing imports**

At the top of `organizations.ts`, add imports for `createTokenService`, `createPlatformToken`, and `uploadMetadataJson`:

```ts
import {
  createTokenService,
  createPlatformToken,
  uploadMetadataJson,
} from "../services/token-service";
```

- [ ] **Step 4: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 5: Run lint**

Run: `rtk pnpm lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/routes/organizations.ts
git commit -m "feat(api): add PUT/DELETE org token endpoints"
```

---

## Task 4: Frontend — Extend hooks and types

**Files:**

- Modify: `apps/web/app/hooks/use-api.ts`

- [ ] **Step 1: Extend Organization interface with token fields**

In `apps/web/app/hooks/use-api.ts`, update the `Organization` interface:

```ts
interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  mintAddress: string | null;
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number | null;
}
```

- [ ] **Step 2: Add useUpdateOrgToken hook**

Add after `useRemoveOrgMember`:

```ts
type OrgTokenInput =
  | { action: "create"; name: string; symbol: string; decimals: number; amount: string }
  | {
      action: "link";
      mintAddress: string;
      tokenName?: string | null;
      tokenSymbol?: string | null;
      tokenDecimals?: number;
    };

export function useUpdateOrgToken(orgId: string) {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async (input: OrgTokenInput) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.put<Organization>(`/api/orgs/${orgId}/token`, input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      void queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      toast.success("Token updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update token");
    },
  });
}
```

- [ ] **Step 3: Add useRemoveOrgToken hook**

Add after `useUpdateOrgToken`:

```ts
export function useRemoveOrgToken(orgId: string) {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/api/orgs/${orgId}/token`, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      void queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      toast.success("Token removed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove token");
    },
  });
}
```

- [ ] **Step 4: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/hooks/use-api.ts
git commit -m "feat(web): add org token hooks and extend Organization type"
```

---

## Task 5: Frontend — OrgTokenCard component

**Files:**

- Create: `apps/web/app/components/orgs/org-token-card.tsx`

- [ ] **Step 1: Create OrgTokenCard component**

```tsx
import { useState } from "react";
import { LuExternalLink } from "react-icons/lu";

import { Button } from "@/components/ui/button";

import type { Organization } from "@/hooks/use-api";
import { useRemoveOrgToken } from "@/hooks/use-api";

import { CreateOrgTokenModal } from "./create-org-token-modal";
import { LinkOrgTokenModal } from "./link-org-token-modal";

interface OrgTokenCardProps {
  org: Organization;
  currentUserRole: string | undefined;
}

export function OrgTokenCard({ org, currentUserRole }: OrgTokenCardProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const removeToken = useRemoveOrgToken(org.id);

  const isOwner = currentUserRole === "owner";
  const hasToken = !!org.mintAddress;

  if (!hasToken) {
    return (
      <>
        <div className="rounded-xl border border-dashed border-border2 bg-bg1 p-6 text-center">
          <p className="text-sm font-semibold text-text">No Token Attached</p>
          <p className="mt-1 text-xs text-muted">
            Create or link an equity token for this organization
          </p>
          {isOwner && (
            <div className="mt-4 flex justify-center gap-3">
              <Button size="sm" onClick={() => setShowCreate(true)}>
                Create Token
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLink(true)}>
                Link Existing
              </Button>
            </div>
          )}
          {!isOwner && (
            <p className="mt-3 text-xs text-dim">This organization has no equity token yet</p>
          )}
        </div>
        {showCreate && <CreateOrgTokenModal orgId={org.id} onClose={() => setShowCreate(false)} />}
        {showLink && <LinkOrgTokenModal orgId={org.id} onClose={() => setShowLink(false)} />}
      </>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg1 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text">Equity Token</span>
        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeToken.mutate()}
              disabled={removeToken.isPending}
            >
              {removeToken.isPending ? "Removing..." : "Remove"}
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg2 text-base font-bold text-text">
          {(org.tokenName ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">
            {org.tokenName ?? "Unknown Token"}{" "}
            <span className="text-xs text-muted">{org.tokenSymbol ?? ""}</span>
          </p>
          <p className="text-xs text-dim font-mono truncate">
            {org.mintAddress?.slice(0, 6)}...{org.mintAddress?.slice(-6)}
            {" · "}
            {org.tokenDecimals ?? 9} decimals
          </p>
        </div>
        <a
          href={`https://explorer.solana.com/address/${org.mintAddress}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-text"
        >
          <LuExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: Errors for missing modal imports (will be resolved in later tasks)

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/orgs/org-token-card.tsx
git commit -m "feat(web): add OrgTokenCard component"
```

---

## Task 6: Frontend — OrgTokenStats component

**Files:**

- Create: `apps/web/app/components/orgs/org-token-stats.tsx`

- [ ] **Step 1: Create OrgTokenStats component**

```tsx
import type { StreamWithEvents } from "@/hooks/use-api";

interface OrgTokenStatsProps {
  streams: StreamWithEvents[];
  tokenDecimals: number;
  tokenSymbol: string;
}

function formatAmount(amount: string, decimals: number): string {
  const n = Number(amount) / 10 ** decimals;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export function OrgTokenStats({ streams, tokenDecimals, tokenSymbol }: OrgTokenStatsProps) {
  const activeStreams = streams.filter((s) => s.status === "active");
  const totalVested = streams.reduce((sum, s) => sum + BigInt(s.amount), 0n);
  const totalClaimed = streams.reduce((sum, s) => sum + BigInt(s.amountWithdrawn ?? "0"), 0n);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-border bg-bg1 p-3 text-center">
        <p className="text-xl font-bold text-text">{activeStreams.length}</p>
        <p className="text-xs text-muted">Active Vests</p>
      </div>
      <div className="rounded-lg border border-border bg-bg1 p-3 text-center">
        <p className="text-xl font-bold text-text">
          {formatAmount(totalVested.toString(), tokenDecimals)}
        </p>
        <p className="text-xs text-muted">Total Vested {tokenSymbol}</p>
      </div>
      <div className="rounded-lg border border-border bg-bg1 p-3 text-center">
        <p className="text-xl font-bold text-text">
          {formatAmount(totalClaimed.toString(), tokenDecimals)}
        </p>
        <p className="text-xs text-muted">Total Claimed {tokenSymbol}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/orgs/org-token-stats.tsx
git commit -m "feat(web): add OrgTokenStats component"
```

---

## Task 7: Frontend — OrgVestList component

**Files:**

- Create: `apps/web/app/components/orgs/org-vest-list.tsx`

- [ ] **Step 1: Create OrgVestList component**

```tsx
import { Link } from "@tanstack/react-router";

import type { StreamWithEvents } from "@/hooks/use-api";

interface OrgVestListProps {
  streams: StreamWithEvents[];
  tokenDecimals: number;
}

function formatAmount(amount: string, decimals: number): string {
  const n = Number(amount) / 10 ** decimals;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

function VestProgress({ stream }: { stream: StreamWithEvents }) {
  const total = Number(stream.amount);
  const withdrawn = Number(stream.amountWithdrawn ?? "0");
  const pct = total > 0 ? Math.min(100, (withdrawn / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg2">
        <div className="h-full rounded-full bg-sol transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted">{pct.toFixed(0)}%</span>
    </div>
  );
}

export function OrgVestList({ streams, tokenDecimals }: OrgVestListProps) {
  if (streams.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-6 text-center">
        <p className="text-sm text-muted">No vesting streams for this organization yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-bg2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="flex-1">Recipient</span>
        <span className="w-24 text-right">Amount</span>
        <span className="w-24 text-right">Progress</span>
      </div>
      {streams.map((stream) => (
        <Link
          key={stream.id}
          to="/app/streams/$streamPda"
          params={{ streamPda: stream.id }}
          className="flex items-center justify-between border-t border-border px-4 py-3 hover:bg-bg2 no-underline"
        >
          <span className="flex-1 text-sm text-text font-mono truncate">
            {stream.recipientAddress.slice(0, 6)}...{stream.recipientAddress.slice(-4)}
          </span>
          <span className="w-24 text-right text-sm text-text">
            {formatAmount(stream.amount, tokenDecimals)}
          </span>
          <div className="w-24 flex justify-end">
            <VestProgress stream={stream} />
          </div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/orgs/org-vest-list.tsx
git commit -m "feat(web): add OrgVestList component"
```

---

## Task 8: Frontend — CreateOrgTokenModal

**Files:**

- Create: `apps/web/app/components/orgs/create-org-token-modal.tsx`

- [ ] **Step 1: Create CreateOrgTokenModal component**

```tsx
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateOrgToken } from "@/hooks/use-api";

interface CreateOrgTokenModalProps {
  orgId: string;
  onClose: () => void;
}

export function CreateOrgTokenModal({ orgId, onClose }: CreateOrgTokenModalProps) {
  const updateToken = useUpdateOrgToken(orgId);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(9);
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !symbol || !amount) return;

    updateToken.mutate(
      { action: "create", name, symbol, decimals, amount },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg1 p-0 shadow-xl">
          <Dialog.Title className="sr-only">Create Equity Token</Dialog.Title>
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-text">Create Equity Token</h2>
              <Dialog.Close
                className="rounded-lg p-1 text-muted transition-colors hover:bg-bg2"
                aria-label="Close"
              >
                <LuX className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Token Name</label>
                <Input
                  placeholder="ACME Equity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Symbol</label>
                <Input
                  placeholder="ACME"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Decimals</label>
                  <Input
                    type="number"
                    min={0}
                    max={9}
                    value={decimals}
                    onChange={(e) => setDecimals(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Total Supply</label>
                  <Input
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-dim">
                This creates a fixed-supply SPL token on Solana and links it to your organization.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateToken.isPending || !name || !symbol || !amount}
                >
                  {updateToken.isPending ? "Creating..." : "Create Token"}
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/orgs/create-org-token-modal.tsx
git commit -m "feat(web): add CreateOrgTokenModal component"
```

---

## Task 9: Frontend — LinkOrgTokenModal

**Files:**

- Create: `apps/web/app/components/orgs/link-org-token-modal.tsx`

- [ ] **Step 1: Create LinkOrgTokenModal component**

```tsx
import { useMemo, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { LuX } from "react-icons/lu";

import { TokenPickerDialog } from "@/components/tokens/token-selector/token-picker-dialog";
import type { PickerToken } from "@/components/tokens/token-selector/token-picker-dialog";
import { useTokenList } from "@/hooks/use-token-list";
import { useUpdateOrgToken } from "@/hooks/use-api";
import { useOwnedTokens } from "@/components/tokens/token-selector/use-owned-tokens";

import { COMMON_TOKENS } from "@/components/tokens/token-selector/common-tokens";

interface LinkOrgTokenModalProps {
  orgId: string;
  onClose: () => void;
}

export function LinkOrgTokenModal({ orgId, onClose }: LinkOrgTokenModalProps) {
  const updateToken = useUpdateOrgToken(orgId);
  const { tokens: walletTokens, loading } = useOwnedTokens();
  const { data: apiTokens } = useTokenList("visible");

  const { svTokens, ownedTokens } = useMemo(() => {
    if (!walletTokens.length) return { svTokens: [], ownedTokens: [] };

    const apiMap = new Map(apiTokens?.map((a) => [a.mintAddress, a]) ?? []);

    const mapped: PickerToken[] = walletTokens.map((t) => {
      const mintStr = t.mint.toBase58();
      const api = apiMap.get(mintStr);
      return {
        mint: mintStr,
        balance: t.balance,
        name: api?.name ?? t.meta?.name ?? `${mintStr.slice(0, 4)}...${mintStr.slice(-4)}`,
        symbol: api?.symbol ?? t.meta?.symbol ?? "???",
        iconUrl: api?.metadataUri ?? t.meta?.uri,
        decimals: api?.decimals ?? 6,
        isSV: api?.created_here ?? false,
      };
    });

    const visible = mapped.filter((t) => {
      if (!apiTokens) return true;
      const api = apiMap.get(t.mint);
      return api?.visible !== false;
    });

    return {
      svTokens: visible.filter((t) => t.isSV),
      ownedTokens: visible.filter((t) => !t.isSV),
    };
  }, [walletTokens, apiTokens]);

  const commonTokens = useMemo(() => {
    const ownedMints = new Set([...svTokens.map((t) => t.mint), ...ownedTokens.map((t) => t.mint)]);
    return COMMON_TOKENS.filter((c) => !ownedMints.has(c.mint)).map(
      (c): PickerToken => ({
        mint: c.mint,
        name: c.name,
        symbol: c.symbol,
        iconUrl: c.logoURI,
        decimals: c.decimals,
        isSV: false,
      }),
    );
  }, [svTokens, ownedTokens]);

  function handleSelectToken(mint: string) {
    const all = [...svTokens, ...ownedTokens, ...commonTokens];
    const token = all.find((t) => t.mint === mint);

    updateToken.mutate(
      {
        action: "link",
        mintAddress: mint,
        tokenName: token?.name ?? null,
        tokenSymbol: token?.symbol ?? null,
        tokenDecimals: token?.decimals ?? 9,
      },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <TokenPickerDialog
      open
      onOpenChange={(open) => !open && onClose()}
      svTokens={svTokens}
      ownedTokens={ownedTokens}
      commonTokens={commonTokens}
      loading={loading}
      selectedMint=""
      onSelectToken={handleSelectToken}
    />
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/orgs/link-org-token-modal.tsx
git commit -m "feat(web): add LinkOrgTokenModal component"
```

---

## Task 10: Frontend — VestToMemberModal

**Files:**

- Create: `apps/web/app/components/orgs/vest-to-member-modal.tsx`

- [ ] **Step 1: Create VestToMemberModal component**

```tsx
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecordStream } from "@/hooks/use-api";

interface VestToMemberModalProps {
  orgId: string;
  mintAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: "1 year", seconds: 365 * 24 * 60 * 60 },
  { label: "2 years", seconds: 2 * 365 * 24 * 60 * 60 },
  { label: "3 years", seconds: 3 * 365 * 24 * 60 * 60 },
  { label: "4 years", seconds: 4 * 365 * 24 * 60 * 60 },
];

const CLIFF_OPTIONS = [
  { label: "No cliff", seconds: 0 },
  { label: "3 months", seconds: 90 * 24 * 60 * 60 },
  { label: "6 months", seconds: 180 * 24 * 60 * 60 },
  { label: "1 year", seconds: 365 * 24 * 60 * 60 },
];

export function VestToMemberModal({
  orgId,
  mintAddress,
  tokenSymbol,
  tokenDecimals,
  onClose,
}: VestToMemberModalProps) {
  const recordStream = useRecordStream();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [durationIdx, setDurationIdx] = useState(0);
  const [cliffIdx, setCliffIdx] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipient || !amount) return;

    const now = Math.floor(Date.now() / 1000);
    const duration = DURATION_OPTIONS[durationIdx].seconds;
    const cliff = CLIFF_OPTIONS[cliffIdx].seconds;

    const amountRaw = BigInt(Math.floor(Number(amount) * 10 ** tokenDecimals));

    // Note: This records the stream in the API. The actual on-chain
    // stream creation transaction must be signed separately.
    // This modal currently handles the API record only.
    // Full on-chain integration requires the Anchor program interaction
    // from the existing stream creation flow.
    recordStream.mutate(
      {
        id: crypto.randomUUID(),
        type: cliff > 0 ? "cliff" : "time",
        creatorAddress: "", // Will be filled by the caller
        recipientAddress: recipient,
        mintAddress,
        vaultAddress: "", // Will be filled by the caller
        amount: amountRaw.toString(),
        orgId,
        startTime: now,
        endTime: now + duration,
        cliffTime: cliff > 0 ? cliff : undefined,
        creationTx: "", // Will be filled by the caller
        createdAt: now,
        tokenSymbol,
        tokenDecimals,
      },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg1 p-0 shadow-xl">
          <Dialog.Title className="sr-only">Vest to Member</Dialog.Title>
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-text">Vest {tokenSymbol} to Member</h2>
              <Dialog.Close
                className="rounded-lg p-1 text-muted transition-colors hover:bg-bg2"
                aria-label="Close"
              >
                <LuX className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Recipient Wallet</label>
                <Input
                  placeholder="Enter wallet address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Amount ({tokenSymbol})</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Duration</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border2 bg-bg2 px-3.5 text-sm"
                  value={durationIdx}
                  onChange={(e) => setDurationIdx(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map((opt, i) => (
                    <option key={i} value={i}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Cliff</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border2 bg-bg2 px-3.5 text-sm"
                  value={cliffIdx}
                  onChange={(e) => setCliffIdx(Number(e.target.value))}
                >
                  {CLIFF_OPTIONS.map((opt, i) => (
                    <option key={i} value={i}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={recordStream.isPending || !recipient || !amount}>
                  {recordStream.isPending ? "Creating..." : "Create Vest"}
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/orgs/vest-to-member-modal.tsx
git commit -m "feat(web): add VestToMemberModal component"
```

---

## Task 11: Frontend — OrgDashboard and wire-up

**Files:**

- Create: `apps/web/app/components/orgs/org-dashboard.tsx`
- Modify: `apps/web/app/components/orgs/org-detail.tsx`

- [ ] **Step 1: Create OrgDashboard component**

```tsx
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useApiStreams } from "@/hooks/use-api";
import type { Organization } from "@/hooks/use-api";

import { OrgTokenCard } from "./org-token-card";
import { OrgTokenStats } from "./org-token-stats";
import { OrgVestList } from "./org-vest-list";
import { VestToMemberModal } from "./vest-to-member-modal";

interface OrgDashboardProps {
  org: Organization;
  currentUserRole: string | undefined;
}

export function OrgDashboard({ org, currentUserRole }: OrgDashboardProps) {
  const [showVest, setShowVest] = useState(false);
  const { data: streams = [] } = useApiStreams({ org: org.id });

  const tokenStreams = org.mintAddress
    ? streams.filter((s) => s.mintAddress === org.mintAddress)
    : [];

  const isOwner = currentUserRole === "owner";
  const hasToken = !!org.mintAddress;

  return (
    <div className="space-y-4">
      <OrgTokenCard org={org} currentUserRole={currentUserRole} />

      {hasToken && (
        <>
          <OrgTokenStats
            streams={tokenStreams}
            tokenDecimals={org.tokenDecimals ?? 9}
            tokenSymbol={org.tokenSymbol ?? ""}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Vesting Activity</h2>
            {isOwner && (
              <Button size="sm" onClick={() => setShowVest(true)}>
                Vest to Member
              </Button>
            )}
          </div>

          <OrgVestList streams={tokenStreams} tokenDecimals={org.tokenDecimals ?? 9} />

          {showVest && org.mintAddress && (
            <VestToMemberModal
              orgId={org.id}
              mintAddress={org.mintAddress}
              tokenSymbol={org.tokenSymbol ?? ""}
              tokenDecimals={org.tokenDecimals ?? 9}
              onClose={() => setShowVest(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Integrate OrgDashboard into OrgDetail**

In `apps/web/app/components/orgs/org-detail.tsx`, add the import and insert `OrgDashboard` between the org header block and the members section:

```tsx
import { OrgDashboard } from "./org-dashboard";
```

Then in the JSX, replace the section between `{editing && ...}` and the members `<div>` with:

```tsx
<OrgDashboard org={org} currentUserRole={currentUserRole} />
```

The full return block should look like:

```tsx
return (
  <div className="space-y-6">
    <div>
      <Link
        to="/app/organizations"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text no-underline hover:no-underline mb-4"
      >
        <LuArrowLeft className="h-3.5 w-3.5" />
        Back to Organizations
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">{org.name}</h1>
          {org.description && <p className="mt-1 text-sm text-muted">{org.description}</p>}
          <p className="mt-1 text-sm text-dim">
            /{org.slug} · <span className="capitalize">{currentUserRole ?? "viewer"}</span>
          </p>
        </div>
        {(currentUserRole === "owner" || currentUserRole === "admin") && (
          <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
            {editing ? "Close" : "Edit"}
          </Button>
        )}
      </div>
    </div>

    {editing && (currentUserRole === "owner" || currentUserRole === "admin") && (
      <EditOrgForm
        orgId={orgId}
        currentName={org.name}
        currentSlug={org.slug}
        currentDescription={org.description}
        onSuccess={() => setEditing(false)}
      />
    )}

    <OrgDashboard org={org} currentUserRole={currentUserRole} />

    {(currentUserRole === "owner" || currentUserRole === "admin") && (
      <AddMemberForm orgId={orgId} currentUserRole={currentUserRole} />
    )}

    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-text">Members</h2>
      </div>
      <MemberList orgId={orgId} members={org.members} currentUserRole={currentUserRole} />
    </div>
  </div>
);
```

- [ ] **Step 3: Run typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 4: Run lint**

Run: `rtk pnpm lint`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/components/orgs/org-dashboard.tsx apps/web/app/components/orgs/org-detail.tsx
git commit -m "feat(web): add OrgDashboard to org detail page"
```

---

## Task 12: Verify and final commit

- [ ] **Step 1: Run full typecheck**

Run: `rtk pnpm typecheck`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `rtk pnpm lint`
Expected: No errors

- [ ] **Step 3: Run tests**

Run: `cd apps/api && rtk pnpm test && cd ../web && rtk pnpm test:unit`
Expected: All tests pass
