# Tooling — Solana Token Distribution Protocol

Tools, dependencies, and code conventions for Solana TDP.

## Contents

1. [Framework](#framework)
2. [Testing](#testing)
3. [Repository layout](#repository-layout)
4. [Code conventions](#code-conventions)

---

## Framework

**Anchor 0.32.1** — Solana program framework. Provides `#[account]` and `#[derive(Accounts)]` macros for account validation, automatic IDL generation, and CPI helpers.

## Testing

**TypeScript + jest + anchor-litesvm.** Tests use `fromWorkspace` to bootstrap the SVM and `LiteSVMProvider` for the Anchor provider. No local validator needed.

### LiteSVM capabilities

- Time travel via `warp_to_slot()`
- Arbitrary account state seeding
- Direct sysvar manipulation
- Compute budget control
- Built-in System Program and SPL Token programs

### Dependencies

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
│   ├── programs/tdp/src/
│   │   ├── lib.rs              # Program entry + declare_id!
│   │   ├── error.rs            # Custom error codes
│   │   ├── event.rs            # Anchor event definitions
│   │   ├── state/              # Account structs (VestingSchedule, enums)
│   │   └── instructions/       # Instruction handlers
│   │       ├── mod.rs
│   │       ├── create_stream.rs
│   │       ├── withdraw.rs
│   │       └── cancel.rs
│   └── tests/
│       ├── stream.000.create.test.ts
│       ├── stream.001.withdraw.test.ts
│       ├── stream.002.cancel.test.ts
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
| Test files | `stream.NNN.instruction.test.ts` | `stream.000.create.test.ts` |
| PDA seeds | Lowercase static strings | `"vesting"`, not `"VestingSchedule"` |
| Instruction files | Match instruction name exactly | `create_stream.rs` |
| TypeScript hooks | Kebab-case | `use-vesting-schedule.ts` |
| SDK entry | Single re-export from `index.ts` | Everything imported from one entry point |

### Test numbering

Test files numbered by instruction execution order:

```
vesting.000.create.test.ts     # stream must exist first
vesting.001.withdraw.test.ts   # then claim vested tokens
vesting.002.cancel.test.ts     # then cancel mid-stream
```

### SDK conventions

The TypeScript SDK wraps the program IDL with typed helpers:

- **PDA helpers** — `getVestingSchedulePda(creator, mint, count, programId)` returns `[PublicKey, bump]`
- **Event parsing** — `parseEvents(provider, program, txSignature)` returns decoded Anchor events from transaction logs
- **Types** — Generated from the Anchor IDL; re-exported from `index.ts`

### Anchor.toml

```toml
[provider]
cluster = "localnet"

[scripts]
test = "jest"
```
