# Solana Token Distribution Protocol (TDP)

A non-custodial, on-chain SPL-token vesting and distribution program built with [Anchor](https://www.anchor-lang.com/) on Solana.

---

## Monorepo Structure

```
Solana-TDP-Program/
├── apps/
│   ├── solana-tdp-anchor/        # Anchor program (Rust + tests)
│   └── web/                      # Future: React frontend
├── packages/
│   └── solana-tdp-sdk/           # Future: TypeScript SDK
├── Cargo.toml                    # Root Rust workspace
├── package.json                  # pnpm 10.33.0 workspace root
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

| Instruction     | Description                                           |
| --------------- | ----------------------------------------------------- |
| `create_stream` | Lock tokens in a PDA vault, record vesting schedule   |
| `withdraw`      | Recipient claims all vested tokens at any time        |
| `cancel`        | Sender cancels; vested → recipient, unvested → sender |

## Account Structure

```
StreamAccount (PDA)  [seeds: b"stream" + sender + recipient]
├── sender             Pubkey
├── recipient          Pubkey
├── mint               Pubkey
├── vault              Pubkey ──▶ VaultTokenAccount (PDA)
│                              [seeds: b"vault" + stream]
├── amount             u64
├── amount_withdrawn   u64
├── start_time         i64
├── end_time           i64
├── cliff_time         i64
├── cancelled          bool
└── bump               u8
```

## Prerequisites

| Tool       | Version       |
| ---------- | ------------- | ------ |
| Rust       | stable ≥ 1.75 |
| Solana CLI | ≥ 1.18        |
|            | Anchor CLI    | 0.32.1 |
| Node.js    | ≥ 20          |
| pnpm       | **10.33.0**   |

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
anchor test
```

This will:

1. Build the program (BPF)
2. Run all 16 TypeScript tests against LiteSVM using Jest

Tests use the `anchor-litesvm` provider (`fromWorkspace("./")` + `LiteSVMProvider`) to load the compiled `.so` and IDL directly. Each test creates fresh token mints, keypairs, and stream fixtures — fully isolated, no network required.

### Test files

| File                                   | Tests                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `solana-tdp.000.create-stream.test.ts` | 6 — happy path, cliff variant, 4 validation rejections                          |
| `solana-tdp.001.withdraw.test.ts`      | 6 — partial/full vesting, cumulative tracking, cliff/start/cancelled rejections |
| `solana-tdp.002.cancel.test.ts`        | 4 — pre-start/partial/post-end splits, double-cancel rejection                  |

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

This executes all three instructions (`create_stream` → `withdraw` → `cancel`) using the devnet wallet as both sender and recipient. A fresh SPL token mint is created for each run. Every transaction links to Solana Explorer for inspection.

**Prerequisites:** The devnet wallet must be funded and the program must be deployed (see above).

## Troubleshooting

### Anchor 0.30.1 → 0.32.1 Upgrade

If you previously used Anchor 0.30.1 and saw errors like `no method named source_file found for struct proc_macro2::Span`, this was a known issue fixed in 0.32.0 onwards — IDL building now uses the stable Rust compiler.

### Stack Offset Error

If you see `Stack offset of ... exceeded max offset of 4096`, you must **Box** large accounts in your instruction contexts. This project already boxes large accounts by default.

## License

MIT
