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

| Instruction | Description |
|---|---|
| `create_stream` | Lock tokens in a PDA vault, record vesting schedule |
| `withdraw` | Recipient claims all vested tokens at any time |
| `cancel` | Sender cancels; vested → recipient, unvested → sender |

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

| Tool | Version |
|---|---|
| Rust | stable ≥ 1.75 |
| Solana CLI | ≥ 1.18 |
|| Anchor CLI | 0.32.1 |
| Node.js | ≥ 20 |
| pnpm | **10.33.0** |

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

## How to Deploy to Devnet

1. **Configure Solana CLI for devnet:**
   ```bash
   solana config set --url devnet
   ```

2. **Ensure you have a wallet with devnet SOL:**
   ```bash
   solana airdrop 2
   ```

3. **Update Program ID (if needed):**
   Update `declare_id!` in `apps/solana-tdp-anchor/programs/solana-tdp/src/lib.rs` and `Anchor.toml` with your program's public key.

4. **Deploy:**
   ```bash
   cd apps/solana-tdp-anchor
   anchor deploy --provider.cluster devnet
   ```

## Troubleshooting

### Anchor 0.30.1 → 0.32.1 Upgrade

If you previously used Anchor 0.30.1 and saw errors like `no method named source_file found for struct proc_macro2::Span`, this was a known issue fixed in 0.32.0 onwards — IDL building now uses the stable Rust compiler.

### Stack Offset Error

If you see `Stack offset of ... exceeded max offset of 4096`, you must **Box** large accounts in your instruction contexts. This project already boxes large accounts by default.

## License

MIT
