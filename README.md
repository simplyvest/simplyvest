# SimplyVest

**Issue, vest, and manage tokenized equity for your team — no crypto wallet required.**

A full-stack platform for tokenized equity vesting on Solana. Web2/web3 hybrid — log in with email or Google, create your organization, issue equity tokens to team members, and vest them on customizable schedules. Built on Anchor for non-custodial on-chain settlement, wrapped in a web2-first UX that anyone can use.

> **Status:** Active development — pivoting from pure solana token distribution protocol infra to tokenized equity with web2-first UX.

## The problem

Founders building Web3-native companies face a broken choice.

Use traditional equity tools like Carta — built for paper stock, manual grants, and teams that all live in one country. Or use crypto vesting tools like Streamflow — which assume everyone has a wallet, knows what gas is, and understands Solana.

Neither works for a hybrid team where some members are technical, some aren't, and everyone is remote. Founders end up in spreadsheets — error-prone, manual, and impossible to scale.

## The solution

SimplyVest is a tokenized equity vesting platform that combines:

- **Web2-first UX** — log in with email or Google via Privy. An embedded Solana wallet is created automatically. No browser extension, no seed phrases, no "what's gas?"
- **On-chain program** — Anchor-based program with PDA-custodied vesting vaults. Supports linear, milestone, and cliff schedules. Only the program can move tokens. Fully open source (MIT).
- **Organizations & equity tokens** — create your company, issue or link an SPL token as your equity token, and vest it to team members.
- **Fullstack application** — React dashboard for founders, web2 API (Cloudflare D1) for fast queries, recipient-facing claim interface. 147+ tests across 4 testing layers.

### Target audience

| Who                                  | Pain point                                                             |
| ------------------------------------ | ---------------------------------------------------------------------- |
| **Web3 founders** launching tokens   | Manual Excel calculations, no simulation, high dump risk               |
| **Non-technical project owners**     | Current tools assume blockchain literacy — steep learning curve        |
| **Hybrid teams**                     | Some members are crypto-native, some aren't — need one tool that works |
| **Launchpads & ecosystem operators** | No way to stress-test distribution plans before launch                 |

## Why not just use existing tools?

|                   | Carta                | Streamflow   | SimplyVest               |
| ----------------- | -------------------- | ------------ | ------------------------ |
| Equity focus      | Yes                  | No           | Yes                      |
| Wallet required   | N/A (web2 only)      | Yes          | No (email/Google login)  |
| Milestone vesting | No                   | No           | Yes                      |
| Linear + cliff    | Yes                  | Yes          | Yes                      |
| Hybrid models     | No                   | No           | Yes (all three combined) |
| On-chain custody  | No                   | Yes          | Yes (PDA vaults)         |
| Open source       | No                   | No           | MIT                      |
| Target audience   | Traditional startups | Crypto teams | Hybrid teams             |

## Project structure

A monorepo managed by pnpm workspaces. The core vesting engine (Anchor program) sits alongside a web2-first dApp, Cloudflare API, and TypeScript SDK.

Domain: [simplyvest.xyz](https://simplyvest.xyz) · Docs: [docs.simplyvest.xyz](https://docs.simplyvest.xyz) · Waitlist: open at simplyvest.xyz

```txt
CONTRIBUTING.md               # Branch workflow, commit conventions, pre-commit hook
SECURITY.md                   # Security policy and reporting
apps/
├── api/                      # Cloudflare Worker API (Hono + D1 + R2)
├── solana-tdp-anchor/        # Anchor program (on-chain vesting logic)
│   ├── programs/solana-tdp/src/ # lib.rs, errors.rs, events.rs, state/, instructions/
│   └── tests/                # Integration tests (vitest + anchor-litesvm)
└── dapp/                     # React frontend (Vite + TanStack Router + Storybook)
packages/
└── solana-tdp-sdk/           # TypeScript SDK (IDL types, PDA helpers, event parsing)
docs/
├── RESEARCH.md               # Vesting types, competitive landscape, market gap, user research
├── ARCHITECTURE.md           # Account model, program instructions, data flow, events/errors
├── REFERENCE.md              # Full program reference with TypeScript code examples per instruction
├── INTEGRATION_GUIDE.md      # Step-by-step integration guide with working code snippets
├── adr/                      # Architecture Decision Records (ADR-001 through ADR-005)
├── TOOLING.md                # Solana tooling decisions, testing strategy, conventions
├── DEPLOYMENT.md             # Build, test, deploy guides, CI/CD
├── OBSERVATIONS.md           # Deferred v2 decisions
└── SECURITY_TESTING_PRESENTATION.md # Security architecture, test coverage, known gaps
```

## Quick start

### Prerequisites

- [Rust](https://rustup.rs/) — `rustup install stable`
  |- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) — v3.1.12
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) — v0.32.1
- [Node.js](https://nodejs.org/) v24+ + [pnpm](https://pnpm.io/) (install: `corepack enable && corepack prepare pnpm@latest --activate`)

### Setup

```bash
# Install dependencies for all workspaces
pnpm install

# Build everything (packages + program)
pnpm build
```

### SDK (for integrators)

```bash
pnpm add @solana-tdp/sdk @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

The SDK provides PDA derivation helpers, instruction account builders, vesting math, event parsing, and account fetch/decode. See [Integration Guide](./docs/INTEGRATION_GUIDE.md) and [Program Reference](./docs/REFERENCE.md).

### Targeted scripts

| Script                   | What it does                                                      |
| ------------------------ | ----------------------------------------------------------------- |
| `pnpm program:build`     | Builds the Anchor program, syncs the IDL into the SDK, builds SDK |
| `pnpm sdk:sync`          | Copies the latest IDL from the program build into the SDK package |
| `pnpm sdk:build`         | Builds only the SDK package                                       |
| `pnpm test`              | Runs all workspace tests                                          |
| `pnpm dev`               | Start API + web in parallel                                       |
| `pnpm dev:web`           | Build SDK + start web app (localhost:5173)                        |
| `pnpm dev:api`           | Start API worker locally (localhost:8787)                         |
| `pnpm build`             | Build all workspaces                                              |
| `pnpm lint`              | JS/TS lint with oxlint                                            |
| `pnpm format`            | Code formatting with oxfmt                                        |
| `pnpm lint:rust`         | Rust clippy with deny warnings                                    |
| `pnpm format:rust`       | Format Rust code with cargo fmt                                   |
| `pnpm format:rust:check` | Check Rust formatting without modifying                           |
| `pnpm check:ts`          | TypeScript check (web)                                            |
| `pnpm check:ts:all`      | TypeScript check (web + API)                                      |
| `pnpm storybook`         | Start Storybook dev server                                        |
| `pnpm deploy:api`        | Deploy API worker to Cloudflare                                   |
| `pnpm db:migrate:remote` | Apply D1 migrations to remote                                     |

### Program ID

After building, get your program ID:

```bash
cd apps/solana-tdp-anchor
anchor keys list
```

Update `declare_id!("...")` in `programs/solana-tdp/src/lib.rs` and `[programs.localnet]` in `Anchor.toml`.

## Documentation

| Document                                                    | Contents                                                                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [Research](./docs/RESEARCH.md)                              | Vesting types (cliff/linear/milestone), competitive landscape, market gap analysis, user research findings, product positioning |
| [Architecture](./docs/ARCHITECTURE.md)                      | Account structure, PDA seeds, program instructions, data flow, edge cases, events and error reference                           |
| [Program Reference](./docs/REFERENCE.md)                    | Every instruction documented with parameters, accounts, validation, errors, events, and TypeScript examples                     |
| [Integration Guide](./docs/INTEGRATION_GUIDE.md)            | Step-by-step for another developer to create streams, withdraw, cancel, and query — with working code snippets                  |
| [ADRs](./docs/adr/)                                         | Architecture Decision Records: PDA seeds, vault design, derived status, vesting curve, batch creation                           |
| [Tooling](./docs/TOOLING.md)                                | Framework, testing setup, repo layout, code conventions                                                                         |
| [Deployment](./docs/DEPLOYMENT.md)                          | Building, testing, program deployment, frontend deployment, CI/CD, browser compatibility                                        |
| [Contributing](./CONTRIBUTING.md)                           | Branch workflow, commit conventions, pre-commit hook behavior                                                                   |
| [Observations](./docs/OBSERVATIONS.md)                      | Deferred v2 decisions: global config, batch creation, Token-2022 hooks                                                          |
| [Security Testing](./docs/SECURITY_TESTING_PRESENTATION.md) | Security architecture, test coverage (~147 tests), CI/CD pipeline, known gaps                                                   |

## Repository

|                         |                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Program ID (devnet)** | [`6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk`](https://explorer.solana.com/address/6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk?cluster=devnet) |
| **Explorer**            | [Solana Explorer (devnet)](https://explorer.solana.com/?cluster=devnet)                                                                           |
| **License**             | MIT                                                                                                                                               |
