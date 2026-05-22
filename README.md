# Solana Token Distribution Protocol

**Plan, simulate, and automate token distribution on Solana — without spreadsheets or smart contract code.**

A full-stack protocol for creating, managing, and claiming token vesting schedules. Built on Anchor for trustless on-chain custody, wrapped in a hybrid dApp that non-technical founders can use from day one.

> **Status:** Early development. Monorepo scaffolded. Program and frontend implementation in progress.

## The problem

Founders launching tokens on Solana face a fragmented toolchain. They model allocations and unlock schedules in Excel (error-prone), then manually transfer tokens through multisig wallets when cliffs hit. Existing vesting tools cover one or two distribution types but lack milestone support, batch creation for large teams, and post-creation flexibility. Worse, the tools that exist assume blockchain literacy — PDAs, CPIs, wallets — locking out non-technical founders.

User interviews with 5 founders and builders confirmed the same pain point: **"The biggest problem is calculate and simulate. Founders struggle here before they even get to token engineering."** — Alex, founder and Solana developer

## The solution

Solana TDP is a token vesting protocol on Solana that combines:

- **On-chain program** — Anchor-based program with PDA-custodied vesting schedules. Supports cliff and linear vesting. Only the program can move tokens.
- **Tokenomics simulator** — Client-side tool to model allocations, stress-test unlock schedules, and catch dump risk before any tokens are locked.
- **Fullstack application** — Hybrid dApp with embedded wallets (Privy/Dynamic), real-time dashboard (Convex), and recipient-facing claim UI.

### Target audience

| Who                                    | Pain point                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------- |
| **Web3 founders** launching new tokens | Manual Excel calculations, no simulation, high dump risk                   |
| **Non-technical project owners**       | Current tools assume blockchain literacy — steep learning curve            |
| **Launchpads & ecosystem operators**   | No way to stress-test whether a project's distribution plan is sustainable |

## Project structure

A monorepo managed by pnpm workspaces.

```txt
apps/
├── solana-tdp-anchor/        # Anchor program (on-chain vesting logic)
│   └── programs/tdp/src/     # lib.rs, error.rs, event.rs, state/, instructions/
└── web/                      # React frontend (Vite + TanStack Router)
packages/
└── solana-tdp-sdk/           # TypeScript SDK (IDL types, PDA helpers, event parsing)
docs/
├── RESEARCH.md               # Vesting types, competitive landscape, market gap, user research
├── ARCHITECTURE.md           # Account model, program instructions, data flow, events/errors
├── TOOLING.md                # Solana tooling decisions, testing strategy, conventions
└── DEPLOYMENT.md             # Build, test, deploy guides, CI/CD
```

## Quick start

### Prerequisites

- [Rust](https://rustup.rs/) — `rustup install stable`
  |- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) — v3.1.12
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) — v0.32.1
- [Node.js](https://nodejs.org/) v18+ + [pnpm](https://pnpm.io/) (install: `corepack enable && corepack prepare pnpm@latest --activate`)

### Setup

```bash
# Install dependencies for all workspaces
pnpm install

# Build everything (packages + program)
pnpm build
```

### Targeted scripts

| Script               | What it does                                                      |
| -------------------- | ----------------------------------------------------------------- |
| `pnpm program:build` | Builds the Anchor program, syncs the IDL into the SDK, builds SDK |
| `pnpm sdk:sync`      | Copies the latest IDL from the program build into the SDK package |
| `pnpm sdk:build`     | Builds only the SDK package                                       |
| `pnpm test`          | Runs all workspace tests                                          |

### Program ID

After building, get your program ID:

```bash
cd apps/solana-tdp-anchor
anchor keys list
```

Update `declare_id!("...")` in `programs/tdp/src/lib.rs` and `[programs.localnet]` in `Anchor.toml`.

## Documentation

| Document                               | Contents                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [Research](./docs/RESEARCH.md)         | Vesting types (cliff/linear/milestone), competitive landscape, market gap analysis, user research findings, product positioning |
| [Architecture](./docs/ARCHITECTURE.md) | Account structure, PDA seeds, program instructions, data flow, edge cases, events and error reference                           |
| [Tooling](./docs/TOOLING.md)           | Framework, testing setup, repo layout, code conventions                                                                         |
| [Deployment](./docs/DEPLOYMENT.md)     | Building, testing, program deployment, frontend deployment, CI/CD, browser compatibility                                        |

## Repository

|                         |                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Program ID (devnet)** | [`6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk`](https://explorer.solana.com/address/6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk?cluster=devnet) |
| **Explorer**            | [Solana Explorer (devnet)](https://explorer.solana.com/?cluster=devnet)                                                                           |
| **License**             | MIT                                                                                                                                               |

## Team

Built as part of the Mancer accelerator — Team 1.
