# solana-tdp

Solana Token Distribution Protocol — tools and contracts for distributing SPL tokens on Solana.

## Status

Early development. Placeholder repository.

## Project structure

A monorepo managed by pnpm workspaces.

```txt
apps/
├── solana-tdp-anchor/           # Anchor program (place for future Solana program)
└── web/                         # Web frontend (place for future React/Vite SPA)
packages/
└── solana-tdp-sdk/              # TypeScript SDK (place for future typed IDL wrappers and PDA helpers)
```

## Workspace packages

| Package           | Scope              | Location                     | Role                                     |
| ----------------- | ------------------ | ---------------------------- | ---------------------------------------- |
| Anchor program    | `@solana-tdp/anchor` | `apps/solana-tdp-anchor/`    | On-chain SPL token distribution protocol |
| Web frontend      | `@solana-tdp/web`    | `apps/web/`                  | React frontend (Vite + TanStack Router)  |
| TypeScript SDK    | `@solana-tdp/sdk`    | `packages/solana-tdp-sdk/`   | Typed IDL wrappers and PDA helpers       |

## Prerequisites

- [Rust](https://rustup.rs/) — `rustup install stable`
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) — v1.18+
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) — v0.32+
- [Node.js](https://nodejs.org/) v18+ + [pnpm](https://pnpm.io/)

## Setup

```bash
# Install dependencies for all workspaces
pnpm install

# Build everything (packages + program)
pnpm build
```

Targeted scripts in the root `package.json`:

| Script               | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm program:build` | Builds the Anchor program, syncs the IDL into the SDK, builds SDK   |
| `pnpm sdk:sync`      | Copies the latest IDL from the program build into the SDK package   |
| `pnpm sdk:build`     | Builds only the SDK package                                         |

## SDK

The `@solana-tdp/sdk` package (`packages/solana-tdp-sdk`) is the TypeScript client for the program. The web app imports it as a workspace dependency.
