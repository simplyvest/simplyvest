# TOOLING.md — Test & Build Tooling

## Build

```bash
cargo build              # Rust compilation
cd apps/solana-tdp-anchor
anchor build             # BPF compilation (for on-chain deployment)
```

## Rust Tests (`#[cfg(test)]` unit tests)

Run with `cargo test` — no SVM/validator required.
Tests live in `#[cfg(test)] mod tests {}` blocks co-located with the source they cover.

## TypeScript Integration Tests (Jest + anchor-litesvm)

Run with:

```bash
cd apps/solana-tdp-anchor
pnpm test
```

Tests use `anchor-litesvm` — fully isolated, no-network integration tests.
Run with `pnpm test`. Each test file covers one instruction family.

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
