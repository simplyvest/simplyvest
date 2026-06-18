# Solana Token Distribution Protocol (TDP)

A non-custodial, on-chain SPL-token vesting and distribution program built with [Anchor](https://www.anchor-lang.com/) on Solana.

---

## Monorepo Structure

```
simply-vest/
├── apps/
│   ├── solana-tdp-anchor/        # Anchor program (Rust + tests)
│   ├── api/                      # Cloudflare Worker API (Hono + D1 + R2)
│   └── web/                      # React frontend (Vite + TanStack Router)
├── packages/
│   └── solana-tdp-sdk/           # TypeScript SDK (IDL types, PDA helpers, event parsing)
├── docs/                         # Architecture, research, deployment docs
├── package.json                  # pnpm workspace root
└── pnpm-workspace.yaml
```

---

## Quick Start (from Root)

Standard commands are proxied to the Anchor app directory:

```bash
# Install dependencies
pnpm install

# Build the program
pnpm build

# Run deploy
pnpm run deploy
```

If you prefer to work directly with the Anchor CLI:

```bash
cd apps/solana-tdp-anchor
anchor build
anchor test
```

## Program Instructions

| Instruction               | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `create_stream`           | Lock tokens in a PDA vault, record vesting schedule     |
| `withdraw`                | Recipient claims a specified amount of vested tokens    |
| `cancel`                  | Creator cancels; vested → recipient, unvested → creator |
| `create_milestone_stream` | Lock tokens pending a milestone trigger                 |
| `trigger_milestone`       | Milestone authority marks milestone as reached          |
| `withdraw_milestone`      | Recipient claims tokens after milestone is triggered    |
| `cancel_milestone`        | Creator cancels milestone stream; unvested → creator    |

## Account Structure

```
StreamAccount (PDA)  [seeds: b"stream" + creator + recipient + mint + vesting_count]
├── creator            Pubkey
├── recipient          Pubkey
├── mint               Pubkey
├── vault              Pubkey ──▶ VaultTokenAccount (PDA)
│                              [seeds: b"vault" + stream]
├── amount             u64
├── amount_withdrawn   u64
├── start_time         i64
├── end_time           i64
├── cliff_time         i64
├── vesting_count      u64
├── cancelled          bool
├── bump               u8
└── vault_bump         u8
```

## Prerequisites

| Tool       | Version       |
| ---------- | ------------- |
| Rust       | stable ≥ 1.75 |
| Solana CLI | ≥ 3.1         |
| Anchor CLI | 0.32.1        |
| Node.js    | ≥ 24          |
| pnpm       | 11.2.2        |

## Setup Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/simplyvest/simplyvest
   cd apps/solana-tdp-anchor
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

## How to Build

Build the Anchor program from the root:

```bash
pnpm build
```

Or from the anchor app directory:

```bash
cd apps/solana-tdp-anchor
anchor build
```

## How to Test

Tests run in-process with [LiteSVM](https://github.com/LiteSVM/litesvm) — no local validator needed.

```bash
cd apps/solana-tdp-anchor
pnpm test
```

This will:

1. Build the program (BPF)
2. Run all TypeScript tests against LiteSVM using vitest

Tests use the `anchor-litesvm` provider (`fromWorkspace("./")` + `LiteSVMProvider`) to load the compiled `.so` and IDL directly. Each test creates fresh token mints, keypairs, and stream fixtures — fully isolated, no network required.

### Test files

| File                                    | Tests                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `solana-tdp.000.create-stream.test.ts`  | Happy path, cliff variant, validation rejections                            |
| `solana-tdp.001.withdraw.test.ts`       | Partial/full vesting, cumulative tracking, cliff/start/cancelled rejections |
| `solana-tdp.002.cancel.test.ts`         | Pre-start/partial/post-end splits, double-cancel rejection                  |
| `solana-tdp.003.milestone.test.ts`      | Milestone creation, trigger, withdraw, cancel flows                         |
| `solana-tdp.005.security-audit.test.ts` | Security edge cases and invariant checks                                    |

---

## How to Deploy to Devnet

> Program ID: [`6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk`](https://explorer.solana.com/address/6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk?cluster=devnet) — same for both localnet and devnet.

1. **Fund the devnet wallet:**

   ```bash
   pnpm run setup-wallet
   # Paste your keypair JSON array when prompted
   ```

   Or generate a fresh keypair:

   ```bash
   solana-keygen new --outfile ./keypairs/devnet-wallet.json
   solana airdrop 2 ./keypairs/devnet-wallet.json
   ```

2. **Deploy:**

   ```bash
   pnpm run deploy
   ```

   This executes `solana program deploy` directly (not `anchor deploy`) on [devnet](https://explorer.solana.com/?cluster=devnet). The devnet wallet must be the program's upgrade authority.

3. **Verify:**
   ```bash
   solana program show 6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk --url devnet
   ```

## Devnet Smoke Test

Run the happy-path end-to-end test against real devnet:

```bash
pnpm run devnet-test
```

This executes the happy-path instructions (`create_stream` → `withdraw` → `cancel`) using the devnet wallet as both creator and recipient. A fresh SPL token mint is created for each run. Every transaction links to Solana Explorer for inspection.

**Prerequisites:** The devnet wallet must be funded and the program must be deployed (see above).

## Troubleshooting

### Anchor 0.30.1 → 0.32.1 Upgrade

If you previously used Anchor 0.30.1 and saw errors like `no method named source_file found for struct proc_macro2::Span`, this was a known issue fixed in 0.32.0 onwards — IDL building now uses the stable Rust compiler.

### Stack Offset Error

If you see `Stack offset of ... exceeded max offset of 4096`, you must **Box** large accounts in your instruction contexts. This project already boxes large accounts by default.

## License

MIT
