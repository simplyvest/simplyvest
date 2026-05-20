# Tooling — Solana Token Distribution Protocol

Tools, dependencies, and code conventions for Solana TDP.

## Contents

1. [Framework](#framework)
2. [Testing](#testing)
3. [Dependencies](#dependencies)
4. [Repository layout](#repository-layout)
5. [Code conventions](#code-conventions)

---

## Framework

**Anchor 0.32.1** — Solana program framework. Provides `#[account]` and `#[derive(Accounts)]` macros for account validation, automatic IDL generation, and CPI helpers.

Anchor 0.32.1 is chosen over the latest Anchor v1 for stability. Anchor v1 introduced breaking changes to the CLI and program macros. While newer, v1's tooling ecosystem is still settling — key crates, testing libraries, and documentation are still being ported. 0.32.1 has mature documentation, broad crate compatibility, and a well-understood upgrade path.

---

## Testing

Two test layers covering program logic and consumer integration.

### Build

```bash
cargo build              # Rust compilation
cd apps/solana-tdp-anchor
anchor build             # BPF compilation (for on-chain deployment)
```

### Rust `#[cfg(test)]` unit tests

Run with `cargo test` — no SVM/validator required. Tests live in `#[cfg(test)] mod tests {}` blocks co-located with the source they cover.


### TypeScript integration tests (Jest + anchor-litesvm)

Run with:
```bash
cd apps/solana-tdp-anchor
pnpm test
```

Tests use the `anchor-litesvm` npm package (v0.2.1) via `LiteSVMProvider`. Each test creates fresh token mints, keypairs, and stream fixtures — fully isolated, no local validator needed. Each test file covers one instruction family.

**Helpers:** `tests/helpers.ts` provides `findStreamPDA`, `findVaultPDA`, `findCreatorConfigPDA`, `now()`, `parseEvents`, `findEvent`.

**Test files:**
| File | Coverage |
|---|---|
| `solana-tdp.000.create-stream.test.ts` | 9 tests — happy path, cliff variant, 4 validation rejections, DurationTooShort, InsufficientBalance, StreamCreated event |
| `solana-tdp.001.withdraw.test.ts` | 13 tests — partial/full vesting, cumulative tracking, cliff/start/cancelled rejections, ExceedsClaimable, TokensClaimed event, closure, 25%/50% percentages, third-party/creator rejections |
| `solana-tdp.002.cancel.test.ts` | 6 tests — pre-start/partial/post-end splits, double-cancel rejection, StreamCancelled event, closure |
| `solana-tdp.003.milestone.test.ts` | Milestone stream creation, trigger, withdraw, cancel |

---

## Dependencies

```json
// apps/solana-tdp-anchor/package.json (devDependencies)
{
  "anchor-litesvm": "^0.2.1",
  "@coral-xyz/anchor": "^0.32.1",
  "@solana/web3.js": "^1.98.4",
  "jest": "^29.0.3",
  "ts-jest": "^29.0.2",
  "typescript": "^5.7.3"
}
```

---

## Repository layout

Monorepo managed by pnpm workspaces.

```
apps/
├── solana-tdp-anchor/
│   ├── programs/solana-tdp/src/
│   │   ├── lib.rs              # Program entry + declare_id!
│   │   ├── errors.rs           # Custom error codes
│   │   ├── events.rs           # Anchor event definitions
│   │   ├── state/              # Account structs (StreamAccount, MilestoneStreamAccount, CreatorConfig)
│   │   │   ├── mod.rs
│   │   │   └── stream_account.rs
│   │   └── instructions/       # Instruction handlers
│   │       ├── mod.rs
│   │       ├── create_stream.rs
│   │       ├── withdraw.rs
│   │       ├── cancel.rs
│   │       ├── create_milestone_stream.rs
│   │       ├── trigger_milestone.rs
│   │       ├── withdraw_milestone.rs
│   │       └── cancel_milestone.rs
│   └── tests/
│       ├── solana-tdp.000.create-stream.test.ts
│       ├── solana-tdp.001.withdraw.test.ts
│       ├── solana-tdp.002.cancel.test.ts
│       ├── helpers.ts
│       ├── utils.ts
│       └── jest-sequencer.js
├── web/                         # React frontend
packages/
└── solana-tdp-sdk/              # TypeScript SDK (future)
```

### File rules

- `state/` — Account structs and enums only. No logic.
- `instructions/` — One file per instruction handler. Each file contains accounts struct, validation, and handler function.
- `errors.rs` — All custom Anchor error codes with descriptive messages.
- `events.rs` — All events emitted by the program. One struct per event.

---

## Code conventions

| What | Convention | Example |
|---|---|---|
| Test files | `solana-tdp.NNN.instruction.test.ts` | `solana-tdp.000.create-stream.test.ts` |
| PDA seeds | Lowercase static strings | `"stream"`, not `"VestingSchedule"` |
| Instruction files | Match instruction name exactly | `create_stream.rs` |
| TypeScript hooks | Kebab-case | `use-vesting-schedule.ts` |

### Test numbering

Test files numbered by instruction execution order:

```
solana-tdp.000.create-stream.test.ts    # stream must exist first
solana-tdp.001.withdraw.test.ts          # then claim vested tokens
solana-tdp.002.cancel.test.ts            # then cancel mid-stream
solana-tdp.003.milestone.test.ts         # milestone lifecycle
```

### Anchor.toml

```toml
[provider]
cluster = "localnet"

[scripts]
test = "jest"
```
