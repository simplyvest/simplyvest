# Token Creation Flow Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace inline mode toggle with a deliberate modal-first flow: Mode Choice → SOL check (wallet) → Form, with fund-wallet modal when balance insufficient.

**Architecture:** New `useSolBalance` hook powers the SOL pre-flight. Two new modal components (`ModeChoiceModal`, `FundWalletModal`) use `@base-ui/react` Dialog. `TokenCreatorForm` drops mode toggle, accepts `mode` prop. `CreateTokenPage` becomes a phase-based state machine.

**Tech Stack:** React 19, `@base-ui/react` Dialog, TanStack React Query, `@solana/web3.js`, Vitest + Storybook test

---

## File Map

| File                                                           | Action     | Purpose                                        |
| -------------------------------------------------------------- | ---------- | ---------------------------------------------- |
| `apps/web/app/hooks/use-sol-balance.ts`                        | **Create** | SOL balance query hook                         |
| `apps/web/app/components/tools/mode-choice-modal.tsx`          | **Create** | Platform vs Wallet choice dialog               |
| `apps/web/app/components/tools/fund-wallet-modal.tsx`          | **Create** | Insufficient SOL warning + copy address        |
| `apps/web/app/components/tools/token-creator-form.tsx`         | **Modify** | Remove mode toggle, accept `mode` prop         |
| `apps/web/app/routes/_tools/-create-token-page.tsx`            | **Modify** | Phase state machine replacing `useState(mode)` |
| `apps/web/app/components/tools/token-creator-form.stories.tsx` | **Create** | Stories for form with `mode` prop              |
| `apps/web/app/components/tools/mode-choice-modal.stories.tsx`  | **Create** | Stories for mode choice dialog                 |
| `apps/web/app/components/tools/fund-wallet-modal.stories.tsx`  | **Create** | Stories for fund wallet dialog                 |

---

### Task 1: `useSolBalance` Hook

**Files:**

- Create: `apps/web/app/hooks/use-sol-balance.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";

export const SOL_THRESHOLD = 11_000_000; // 0.011 SOL

export function useSolBalance() {
  const { publicKey } = useAuth();
  const { connection } = useConnection();

  const query = useQuery({
    queryKey: ["sol-balance", publicKey?.toBase58()],
    queryFn: () => {
      if (!publicKey) return 0;
      return connection.getBalance(publicKey);
    },
    enabled: !!publicKey,
    staleTime: 15_000,
  });

  return {
    balance: query.data ?? 0,
    isFetching: query.isFetching,
    isFetched: query.isFetched,
    refetch: query.refetch,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/hooks/use-sol-balance.ts
git commit -m "feat: add useSolBalance hook with SOL_THRESHOLD constant"
```

---

### Task 2: `ModeChoiceModal` Component

**Files:**

- Create: `apps/web/app/components/tools/mode-choice-modal.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Dialog } from "@base-ui/react/dialog";

type Mode = "platform" | "wallet";

type ModeChoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: Mode) => void;
};

function handleSelect(
  mode: Mode,
  onSelectMode: (mode: Mode) => void,
  onOpenChange: (open: boolean) => void,
) {
  onSelectMode(mode);
  onOpenChange(false);
}

export function ModeChoiceModal({ open, onOpenChange, onSelectMode }: ModeChoiceModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">
            How would you like to create this token?
          </Dialog.Title>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {/* Platform card */}
            <button
              type="button"
              onClick={() => handleSelect("platform", onSelectMode, onOpenChange)}
              className="flex flex-col rounded-xl border border-border p-4 text-left transition-all hover:border-sol hover:bg-sol/5 focus:outline-none focus:ring-2 focus:ring-sol"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sol/10 text-sm">
                  SV
                </span>
                <span className="text-sm font-semibold">Create for Me</span>
              </div>
              <p className="mt-1.5 text-xs text-muted">Free, we handle it</p>

              <ul className="mt-4 space-y-2 text-xs text-text text-left">
                <li className="flex gap-1.5">
                  <span className="text-sol shrink-0">Gas</span>
                  <span className="text-muted">Covered by SimplyVest</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-sol shrink-0">Signing</span>
                  <span className="text-muted">We create it for your account</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-sol shrink-0">Need</span>
                  <span className="text-muted">Just a connected wallet</span>
                </li>
              </ul>

              <span className="mt-auto pt-4 text-sm font-medium text-sol">
                Create Token on Platform
              </span>
            </button>

            {/* Wallet card */}
            <button
              type="button"
              onClick={() => handleSelect("wallet", onSelectMode, onOpenChange)}
              className="flex flex-col rounded-xl border border-border p-4 text-left transition-all hover:border-sol hover:bg-sol/5 focus:outline-none focus:ring-2 focus:ring-sol"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-field text-sm">
                  W
                </span>
                <span className="text-sm font-semibold">Create with Wallet</span>
              </div>
              <p className="mt-1.5 text-xs text-muted">You sign, you control</p>

              <ul className="mt-4 space-y-2 text-xs text-left">
                <li className="flex gap-1.5">
                  <span className="text-sol shrink-0">Gas</span>
                  <span className="text-muted">You pay ~0.011 SOL</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-sol shrink-0">Signing</span>
                  <span className="text-muted">You sign with your wallet</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-sol shrink-0">Need</span>
                  <span className="text-muted">SOL in your wallet</span>
                </li>
              </ul>

              <span className="mt-auto pt-4 text-sm font-medium text-sol">
                Create Token with Wallet
              </span>
            </button>
          </div>

          <Dialog.Close
            className="absolute top-4 right-4 rounded-lg p-1 text-muted transition-colors hover:bg-field"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/tools/mode-choice-modal.tsx
git commit -m "feat: add ModeChoiceModal with side-by-side platform vs wallet cards"
```

---

### Task 3: `FundWalletModal` Component

**Files:**

- Create: `apps/web/app/components/tools/fund-wallet-modal.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Dialog } from "@base-ui/react/dialog";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatSol } from "@/utils/format";

type FundWalletModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  currentBalance: number; // lamports
  onFunded: () => void;
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function FundWalletModal({
  open,
  onOpenChange,
  walletAddress,
  currentBalance,
  onFunded,
}: FundWalletModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    copyToClipboard(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Not Enough SOL</Dialog.Title>

          <p className="mt-3 text-sm text-muted">
            Your wallet needs at least <span className="font-medium text-text">0.011 SOL</span> to
            cover the token creation cost.
          </p>

          <div className="mt-4 rounded-lg border border-border bg-bg1 p-3">
            <p className="text-xs text-muted">Current balance</p>
            <p className="text-lg font-semibold text-warn">{formatSol(currentBalance)} SOL</p>
          </div>

          <p className="mt-4 text-xs font-medium text-text">Your wallet address</p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border bg-bg1 px-3 py-2 text-xs text-text">
              {walletAddress}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted">
            Send at least 0.011 SOL to this address, then come back and click below.
          </p>

          <Button variant="default" className="mt-4 w-full" onClick={onFunded}>
            I've Funded My Wallet
          </Button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/tools/fund-wallet-modal.tsx
git commit -m "feat: add FundWalletModal with copyable address and re-check"
```

---

### Task 4: Refactor `TokenCreatorForm`

**Files:**

- Modify: `apps/web/app/components/tools/token-creator-form.tsx`

- [ ] **Step 1: Remove mode toggle section, add `mode` prop, update button label**

Remove lines 15 and 168-199 (the `CreationMode` type export and the mode toggle UI section). Change the props interface and button label:

Replace the entire `TokenCreatorForm` function signature (lines 15-33) with:

```tsx
export function TokenCreatorForm({
  onSubmit,
  isPending,
  mode,
}: {
  onSubmit: (data: {
    name: string;
    symbol: string;
    decimals: number;
    amount: string;
    image?: File;
  }) => void;
  isPending: boolean;
  mode: "platform" | "wallet";
}) {
```

Replace the submit button (lines 211-213) with:

```tsx
<Button variant="default" onClick={handleSubmit} disabled={!canSubmit} className="w-full">
  {isPending
    ? "Creating Token..."
    : mode === "platform"
      ? "Create Token on Platform"
      : "Create Token with Wallet"}
</Button>
```

- [ ] **Step 2: Verify the file parses**

Run: `pnpm --filter @solana-tdp/web exec tsgo --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/tools/token-creator-form.tsx
git commit -m "refactor: remove mode toggle from TokenCreatorForm, accept mode as prop"
```

---

### Task 5: Refactor `CreateTokenPage` to Phase State Machine

**Files:**

- Modify: `apps/web/app/routes/_tools/-create-token-page.tsx`

- [ ] **Step 1: Rewrite the page with phase-based state machine**

Full file:

```tsx
import { useCallback, useEffect, useState } from "react";

import { TokenCreatorForm } from "@/components/tools/token-creator-form";
import { TokenCreatorSuccess } from "@/components/tools/token-creator-success";
import { FundWalletModal } from "@/components/tools/fund-wallet-modal";
import { ModeChoiceModal } from "@/components/tools/mode-choice-modal";
import { useCreatePlatformToken } from "@/hooks/use-create-platform-token";
import { useCreateToken } from "@/hooks/use-create-token";
import { SOL_THRESHOLD, useSolBalance } from "@/hooks/use-sol-balance";
import { useAuth } from "@/lib/solana/use-auth";
import { formatSol } from "@/utils/format";

const SOLANA_EXPLORER = import.meta.env.VITE_SOLANA_EXPLORER ?? "https://explorer.solana.com";

type Mode = "platform" | "wallet";
type Phase = "mode-choice" | "sol-check" | "form" | "fund-wallet";

function getChain(): string {
  const envChain = import.meta.env.VITE_SOLANA_CHAIN;
  return typeof envChain === "string" ? envChain : "solana:devnet";
}

export function CreateTokenPage() {
  const createToken = useCreateToken();
  const createPlatformToken = useCreatePlatformToken();
  const { publicKey } = useAuth();
  const { balance, isFetching, isFetched, refetch } = useSolBalance();

  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("mode-choice");
  const [result, setResult] = useState<{
    mintAddress: string;
    txSignature: string;
    name: string;
    symbol: string;
  } | null>(null);

  const handleSelectMode = useCallback((m: Mode) => {
    setMode(m);
    if (m === "platform") {
      setPhase("form");
    } else {
      setPhase("sol-check");
    }
  }, []);

  // Wait for SOL balance fetch to complete, then decide next phase
  useEffect(() => {
    if (mode !== "wallet" || phase !== "sol-check") return;
    if (isFetching || !isFetched) return;
    if (balance >= SOL_THRESHOLD) {
      setPhase("form");
    } else {
      setPhase("fund-wallet");
    }
  }, [mode, phase, balance, isFetching, isFetched]);

  const handleFunded = useCallback(async () => {
    const result = await refetch();
    if (result.data !== undefined && result.data >= SOL_THRESHOLD) {
      setPhase("form");
    }
  }, [refetch]);

  const activeMutation = mode === "platform" ? createPlatformToken : createToken;

  // Success
  if (result) {
    const cluster = getChain() === "solana:mainnet" ? "" : "?cluster=devnet";
    return (
      <TokenCreatorSuccess
        mintAddress={result.mintAddress}
        txSignature={result.txSignature}
        name={result.name}
        symbol={result.symbol}
        explorerUrl={`${SOLANA_EXPLORER}/tx/${result.txSignature}${cluster}`}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Mode Choice Modal */}
      <ModeChoiceModal
        open={phase === "mode-choice"}
        onOpenChange={(open) => {
          if (!open) window.history.back();
        }}
        onSelectMode={handleSelectMode}
      />

      {/* SOL check loading */}
      {phase === "sol-check" && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted animate-pulse">Checking wallet balance…</p>
        </div>
      )}

      {/* Fund Wallet Modal */}
      {phase === "fund-wallet" && publicKey && (
        <FundWalletModal
          open
          onOpenChange={() => setPhase("mode-choice")}
          walletAddress={publicKey.toBase58()}
          currentBalance={balance}
          onFunded={handleFunded}
        />
      )}

      {/* Form */}
      {phase === "form" && mode && (
        <TokenCreatorForm
          mode={mode}
          onSubmit={(data) =>
            activeMutation.mutate(data, {
              onSuccess: (res) => setResult(res),
            })
          }
          isPending={activeMutation.isPending}
        />
      )}

      {/* Back button when in form mode */}
      {phase === "form" && (
        <button
          type="button"
          onClick={() => setPhase("mode-choice")}
          className="mt-4 w-full text-center text-xs text-muted hover:text-text transition-colors"
        >
          Change creation mode
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @solana-tdp/web exec tsgo --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/routes/_tools/-create-token-page.tsx
git commit -m "feat: replace mode toggle with phase-based modal-first token creation flow"
```

---

### Task 6: Stories

**Files:**

- Create: `apps/web/app/components/tools/token-creator-form.stories.tsx`
- Create: `apps/web/app/components/tools/mode-choice-modal.stories.tsx`
- Create: `apps/web/app/components/tools/fund-wallet-modal.stories.tsx`

- [ ] **Step 1: Write `token-creator-form.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { TokenCreatorForm } from "./token-creator-form";

const meta = {
  component: TokenCreatorForm,
  args: {
    onSubmit: fn(),
    isPending: false,
    mode: "platform",
  },
} satisfies Meta<typeof TokenCreatorForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Platform: Story = {
  play: async ({ canvas, step }) => {
    await step("shows platform submit button", async () => {
      await expect(
        canvas.getByRole("button", { name: /create token on platform/i }),
      ).toBeInTheDocument();
    });
  },
};

export const Wallet: Story = {
  args: {
    mode: "wallet",
  },
  play: async ({ canvas, step }) => {
    await step("shows wallet submit button", async () => {
      await expect(
        canvas.getByRole("button", { name: /create token with wallet/i }),
      ).toBeInTheDocument();
    });
  },
};

export const Pending: Story = {
  args: {
    isPending: true,
  },
  play: async ({ canvas, step }) => {
    await step("shows creating state on button", async () => {
      await expect(canvas.getByRole("button", { name: /creating token/i })).toBeInTheDocument();
    });
  },
};
```

- [ ] **Step 2: Write `mode-choice-modal.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect, userEvent } from "storybook/test";

import { ModeChoiceModal } from "./mode-choice-modal";

const meta = {
  component: ModeChoiceModal,
  args: {
    open: true,
    onOpenChange: fn(),
    onSelectMode: fn(),
  },
} satisfies Meta<typeof ModeChoiceModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders title", async () => {
      await expect(canvas.getByText(/how would you like/i)).toBeInTheDocument();
    });
    await step("renders platform card", async () => {
      await expect(canvas.getByText("Create for Me")).toBeInTheDocument();
      await expect(canvas.getByText("Create Token on Platform")).toBeInTheDocument();
    });
    await step("renders wallet card", async () => {
      await expect(canvas.getByText("Create with Wallet")).toBeInTheDocument();
      await expect(canvas.getByText("Create Token with Wallet")).toBeInTheDocument();
    });
  },
};

export const SelectPlatform: Story = {
  play: async ({ args, canvas, step }) => {
    await step("clicking platform card selects platform mode", async () => {
      await userEvent.click(canvas.getByText("Create Token on Platform"));
      await expect(args.onSelectMode).toHaveBeenCalledWith("platform");
    });
  },
};

export const SelectWallet: Story = {
  play: async ({ args, canvas, step }) => {
    await step("clicking wallet card selects wallet mode", async () => {
      await userEvent.click(canvas.getByText("Create Token with Wallet"));
      await expect(args.onSelectMode).toHaveBeenCalledWith("wallet");
    });
  },
};
```

- [ ] **Step 3: Write `fund-wallet-modal.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect, userEvent } from "storybook/test";

import { FundWalletModal } from "./fund-wallet-modal";

const meta = {
  component: FundWalletModal,
  args: {
    open: true,
    onOpenChange: fn(),
    walletAddress: "DRpbCBMxVnDK7maPMpNpowE5J5fB4suoA1YpF8fZQmYP",
    currentBalance: 2_500_000, // 0.0025 SOL
    onFunded: fn(),
  },
} satisfies Meta<typeof FundWalletModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders heading", async () => {
      await expect(canvas.getByText("Not Enough SOL")).toBeInTheDocument();
    });
    await step("shows threshold", async () => {
      await expect(canvas.getByText("0.011 SOL", { exact: false })).toBeInTheDocument();
    });
    await step("shows wallet address", async () => {
      await expect(
        canvas.getByText("DRpbCBMxVnDK7maPMpNpowE5J5fB4suoA1YpF8fZQmYP"),
      ).toBeInTheDocument();
    });
    await step("shows current balance", async () => {
      await expect(canvas.getByText("0.0025")).toBeInTheDocument();
    });
    await step("renders funded button", async () => {
      await expect(canvas.getByRole("button", { name: /i've funded/i })).toBeInTheDocument();
    });
  },
};

export const ClickFunded: Story = {
  play: async ({ args, canvas, step }) => {
    await step("clicking funded calls onFunded", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /i've funded/i }));
      await expect(args.onFunded).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClickCopy: Story = {
  play: async ({ canvas, step }) => {
    await step("clicking copy shows Copied", async () => {
      const copyBtn = canvas.getByRole("button", { name: /copy/i });
      await userEvent.click(copyBtn);
      // After click, button text changes to "Copied"
      await expect(canvas.getByRole("button", { name: /copied/i })).toBeInTheDocument();
    });
  },
};
```

- [ ] **Step 4: Run storybook tests**

Run: `pnpm --filter @solana-tdp/web exec vitest run --project storybook 2>&1 | tail -20`
Expected: All new stories pass

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/components/tools/token-creator-form.stories.tsx apps/web/app/components/tools/mode-choice-modal.stories.tsx apps/web/app/components/tools/fund-wallet-modal.stories.tsx
git commit -m "test: add stories for mode choice, fund wallet, and refactored token creator form"
```

---

### Task 7: Full Verification

**Files:** None (verification only)

- [ ] **Step 1: Run all web tests**

Run: `pnpm --filter @solana-tdp/web test`
Expected: All 166+ tests pass

- [ ] **Step 2: Run lint check**

Run: `pnpm --filter @solana-tdp/web exec oxlint --fix && pnpm --filter @solana-tdp/web exec oxfmt --check`
Expected: No errors

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @solana-tdp/web exec tsgo --noEmit`
Expected: No errors

- [ ] **Step 4: Run API tests**

Run: `pnpm --filter @solana-tdp/api test`
Expected: All 6 tests pass

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: fix lint/type issues from token creation flow redesign"
```
