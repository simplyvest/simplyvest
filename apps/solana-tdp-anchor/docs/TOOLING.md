# TOOLING.md — Test & Build Tooling

## Build

```bash
cargo build              # Rust compilation
cd apps/solana-tdp-anchor
anchor build             # BPF compilation (for on-chain deployment)
```

## Rust Tests (`#[cfg(test)]` unit tests)

Run with plain `cargo test` — no SVM/validator required.

| File | Test | Verifies |
|---|---|---|
| `programs/solana-tdp/src/state/stream_account.rs` | `test_struct_layout` | StreamAccount `INIT_SPACE` = 179 (payload), 187 (with discriminator) |
| `programs/solana-tdp/src/state/stream_account.rs` | `test_creator_config_size` | CreatorConfig `INIT_SPACE` = 40 (payload), 48 (with discriminator) |
| `programs/solana-tdp/src/errors.rs` | `test_error_discriminants` | Each error variant maps to correct numeric code |
| `programs/solana-tdp/src/errors.rs` | `test_error_messages` | Each error `#[msg]` matches specification |
| `programs/solana-tdp/src/events.rs` | `test_event_serialization_round_trip` | Event Borsh serialization round-trips correctly |
| `programs/solana-tdp/src/instructions/create_stream.rs` | `test_pda_derivation` | PDA derivation with new seeds returns expected address |

### Adding Rust tests

Tests live in `#[cfg(test)] mod tests {}` blocks co-located with the source they cover.

## TypeScript Integration Tests (Jest + anchor-litesvm)

Run with:

```bash
cd apps/solana-tdp-anchor
pnpm test
```

Tests use `anchor-litesvm` (`fromWorkspace("./")` + `LiteSVMProvider`) to load the compiled `.so` and IDL directly. Each test creates fresh token mints, keypairs, and stream fixtures — fully isolated, no network required.

### Test files

| File | Tests |
|---|---|
| `solana-tdp.000.create-stream.test.ts` | 6 — happy path, cliff variant, 4 validation rejections |
| `solana-tdp.001.withdraw.test.ts` | 6 — partial/full vesting, cumulative tracking, cliff/start/cancelled rejections |
| `solana-tdp.002.cancel.test.ts` | 4 — pre-start/partial/post-end splits, double-cancel rejection |

Helpers: `tests/helpers.ts` provides `findStreamPDA`, `findVaultPDA`, `now()`.

## Future SVM-based Rust Testing

For SVM-backed Rust integration tests in future phases, evaluate the `litesvm` crate for compatibility with Anchor 0.32.x + Solana 2.3.0.

`anchor-litesvm` crate (Rust) is **not compatible** with Anchor 0.32.x — it requires Anchor 1.0.0 + Solana 3.0.0. The TS npm package `anchor-litesvm@^0.2.1` is used for JS tests only.

## File Layout

```
programs/solana-tdp/src/
├── lib.rs              # Program entry + declare_id!
├── errors.rs           # Custom error codes
├── events.rs           # Event definitions
├── state/              # Account structs
│   ├── mod.rs
│   └── stream_account.rs
└── instructions/       # Instruction handlers
    ├── mod.rs
    ├── create_stream.rs
    ├── withdraw.rs
    └── cancel.rs
```
