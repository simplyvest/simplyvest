# Tooling — Solana Token Distribution Protocol

Tooling decisions, testing strategy, and code conventions for Solana TDP.

## Contents

1. [Anchor vs Pinocchio](#anchor-vs-pinocchio)
2. [Testing tools](#testing-tools)
3. [Repository organization](#repository-organization)
4. [Code conventions](#code-conventions)

---

## Anchor vs Pinocchio

| | Anchor 0.32.1 | Pinocchio |
|---|---|---|
| **Approach** | Macro-based eDSL, automatic serialization, IDL generation | Lower-level, zero-copy deserialization, manual validation |
| **DX** | High — `#[account]`, `#[derive(Accounts)]`, `anchor build` emits IDL | Low — manual account checking, discriminator handling |
| **Program size** | Larger binaries | Significantly smaller |
| **Client generation** | Automatic via IDL | Manual |
| **Best for** | Teams building Solana familiarity, rapid development | Experienced teams optimizing for program size |

**Decision: Anchor 0.32.1.** The team is building Solana familiarity and Anchor's guardrails (account validation, IDL generation, CPI macros) reduce the surface area for mistakes. If program size becomes a constraint later, Pinocchio is the path we would evaluate.

---

## Testing tools

### Tool status

| Tool | Status | Use case |
|---|---|---|
| **LiteSVM** | Active (recommended) | Fast, in-process testing — Rust, TS/JS, Python |
| **anchor-litesvm** | Active | Anchor-compatible testing without a validator |
| **solana-test-validator** | Active | When you need a real local RPC node |
| **Bankrun** | Deprecated (Mar 2025) | Migrate to LiteSVM |
| **solana-program-test** | Legacy | Existing projects OK; new projects → LiteSVM |

**Testing is TypeScript-only, using `anchor-litesvm`.** Tests use `fromWorkspace` to bootstrap the SVM, `LiteSVMProvider` for the Anchor provider, and jest to cover each instruction lifecycle.

Use `solana-test-validator` only when you need a real local RPC node. Do not use Bankrun — it is deprecated.

### LiteSVM key capabilities

- Time travel via `warp_to_slot()`
- Arbitrary account state seeding
- Direct sysvar manipulation
- Compute budget control
- Built-in System Program and SPL Token programs

### Install

```json
// package.json (devDependencies)
{
  "anchor-litesvm": "^0.2.1",
  "@coral-xyz/anchor": "^0.32.1",
  "@solana/web3.js": "^1.98.4"
}
```

---

## Repository organization

Monorepo managed by pnpm workspaces.

### Program file layout

```
apps/
├── solana-tdp-anchor/
│   ├── programs/tdp/src/
│   │   ├── lib.rs              # Program entry + declare_id!
│   │   ├── error.rs            # Custom error codes
│   │   ├── event.rs            # Anchor event definitions
│   │   ├── state/              # Account structs (VestingSchedule, enums)
│   │   └── instructions/       # Instruction handlers
│   │       ├── mod.rs
│   │       ├── create_vesting.rs
│   │       ├── withdraw.rs
│   │       └── cancel.rs
│   └── tests/
│       ├── vesting.000.create.test.ts
│       ├── vesting.001.withdraw.test.ts
│       ├── vesting.002.cancel.test.ts
│       └── utils.ts
├── web/                         # React frontend
packages/
└── solana-tdp-sdk/              # TypeScript SDK
    └── src/
        ├── index.ts
        ├── pda.ts               # PDA derivation helpers
        ├── events.ts            # Event parsing
        ├── types/               # Generated types from IDL
        └── idl/                 # Program IDL
```

### File rules

- `state/` — Account structs and enums only. No logic.
- `instructions/` — One file per instruction handler. Each file contains accounts struct, validation, and handler function.
- `error.rs` — All custom Anchor error codes with descriptive messages.
- `event.rs` — All events emitted by the program. One struct per event.

---

## Code conventions

| What | Convention | Example |
|---|---|---|
| Test files | `vesting.NNN.instruction.test.ts` | `vesting.000.create.test.ts` |
| PDA seeds | Lowercase static strings | `"vesting"`, not `"VestingSchedule"` |
| Instruction files | Match instruction name exactly | `create_vesting.rs` |
| TypeScript hooks | Kebab-case | `use-vesting-schedule.ts` |
| SDK entry | Single re-export from `index.ts` | Everything imported from one entry point |

### Test numbering

Test files are numbered by instruction execution order, not alphabetical:

```
vesting.000.create.test.ts     # runs first — stream must exist
vesting.001.withdraw.test.ts   # runs second — claim vested tokens
vesting.002.cancel.test.ts     # runs third — cancel mid-stream
```

This mirrors the natural lifecycle and makes dependencies obvious.

### SDK conventions

The TypeScript SDK wraps the program IDL and provides helpers for common operations:

- **PDA helpers** — `getVestingSchedulePda(creator, mint, count, programId)` returns `[PublicKey, bump]`
- **Event parsing** — `parseEvents(provider, program, txSignature)` returns decoded event objects from transaction logs
- **Types** — Generated from the Anchor IDL; re-exported from `index.ts`

### Anchor.toml

```toml
[provider]
cluster = "localnet"

[scripts]
test = "jest"
```
