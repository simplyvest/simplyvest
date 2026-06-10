# Token Creation Flow Redesign

**Date:** 2026-06-09
**Branch:** `feat/token-tools`

## Overview

Replace the inline mode toggle inside the token creation form with a deliberate two-step flow:

1. **Mode Choice modal** — user picks "Create for me" (Platform) or "Create with wallet" (Wallet) before seeing the form
2. **Wallet mode pre-flight** — SOL balance check before form; fund-wallet modal if insufficient

The form itself becomes mode-agnostic, receiving `mode` as a required prop with no internal toggle.

## Flow

```
/CLICK "Create Token"
       ↓
  MODE CHOICE MODAL (side-by-side cards)
       ↓
  ┌────┴────┐
platform    wallet
  │              │
  │         SOL CHECK (>= 0.011 SOL?)
  │              │
  │        ┌─────┴─────┐
  │       no           yes
  │        │             │
  │   FUND WALLET       │
  │   MODAL             │
  │   (copy addr +      │
  │    "I funded"→recheck)│
  │        │             │
  │   SOL CHECK ←────────┘
  │        │
  └────────┘
       ↓
  TOKEN FORM (same fields, different submit)
       ↓
  SUCCESS PAGE
```

## Components

### New

**`use-sol-balance.ts`** — Hook in `apps/web/app/hooks/`

- Calls `connection.getBalance(publicKey)` via `useConnection()` + `useAuth()`
- Returns `{ balance: number, formattedBalance: string, isFetching: boolean, refetch: () => void }`
- Null-safe when `publicKey` is null (returns 0 balance)

**`mode-choice-modal.tsx`** — `apps/web/app/components/tools/`

- Two side-by-side cards rendered inside a `@base-ui/react` `Dialog`
- Each card shows: heading, tagline, 3 bullet points (who pays, who signs, what you need), CTA button
- Clicking a card or its button selects the mode and closes the dialog
- Platform card: "Create for Me" / "Free, we handle it" / "Create Token on Platform"
- Wallet card: "Create with Wallet" / "You sign, you control" / "Create Token with Wallet"

**`fund-wallet-modal.tsx`** — `apps/web/app/components/tools/`

- Rendered inside a `@base-ui/react` `Dialog`
- Shows: heading "Not Enough SOL", wallet address in monospace with copy button, current balance, "You need at least 0.011 SOL to create a token"
- "I've Funded My Wallet" button → calls `refetch()` from `useSolBalance`, if >= 0.011 SOL dismisses

### Modified

**`token-creator-form.tsx`**

- Remove internal mode toggle (radio button row)
- New required prop: `mode: "platform" | "wallet"`
- Submit button label: `"Create Token on Platform"` / `"Create Token with Wallet"`
- Remove `onModeChange` prop
- All other props, fields, validation, image upload unchanged

**`-create-token-page.tsx`**

- Replace `mode` state with phase-based state machine
- Phases: `"mode-choice"` | `"sol-check"` | `"form"` | `"fund-wallet"` | `"success"`
- Mode choice modal shown on mount (phase `"mode-choice"`)
- Wallet path: phase `"sol-check"` → balance fetched → `"form"` or `"fund-wallet"`
- Platform path: phase `"mode-choice"` → `"form"` directly
- Success: renders `TokenCreatorSuccess` when `result` is set

### Unchanged

- `use-create-token.ts` hook
- `use-create-platform-token.ts` hook
- `token-creator-success.tsx`
- `app.tools.create-token.tsx` route file (lazy loader)
- Image compression logic

## SOL Threshold

Derived from `createTokenInstructions()` costs in `packages/solana-tdp-sdk/src/token.ts`:

| Instruction              | Bytes | Rent (lamports)              |
| ------------------------ | ----- | ---------------------------- |
| Mint account creation    | 82    | 1,461,600                    |
| Token account (ATA)      | 165   | 2,039,280                    |
| Metaplex metadata PDA    | ~679  | ~5,616,720                   |
| Transaction fee (2 sigs) | —     | 10,000                       |
| **Total**                |       | **~9,127,600 (0.00913 SOL)** |

**Threshold:** 0.011 SOL (~20% buffer for metadata size variance)

## Error Handling

- SOL balance fetch failure: treat as if balance = 0, show fund-wallet modal
- Balance re-check after funding: if still insufficient, keep modal open
- No changes to existing transaction error handling (toasts from hooks)

## Testing

- New story for `TokenCreatorForm` with `mode` prop (platform variant + wallet variant)
- Story for `ModeChoiceModal`
- Story for `FundWalletModal`
- Update existing `TokenCreatorForm` stories that referenced `onModeChange`
- Verify all existing tests still pass
