---
title: "Observations"
description: "Deferred v2 decisions: global config, batch creation, Token-2022 hooks."
sidebar:
  label: "Observations"
---

# Observations — Deferred decisions for v2

This document captures architectural decisions, market gaps, and feature requests that were discussed during the architecture re-assessment but deferred from the MVP. These are not promises — they are notes for future evaluation.

## Global protocol configuration account

**What:** A `ProgramConfig` PDA storing protocol-level parameters: pause flag, fee rate, fee recipient, protocol authority.

**Why deferred:** MVP has no fees, no pause mechanism, no governance. Upgrade authority is handled by Solana CLI (`solana program upgrade` with authority keypair). Adding a global config before it's needed would increase program complexity and instruction account lists for zero MVP benefit.

**Re-evaluate when:** Fee model is designed, or governance/DAO control is required.

## Native batch creation instruction

**What:** An on-chain `create_batch` instruction that creates multiple streams atomically in a single program invocation.

**Why deferred:** MVP uses SDK-level batching (multiple `create_stream` instructions in one transaction, chunked 3–4 per tx). This provides near-atomic batches with one signature per chunk without changing the program.

**Limit:** Solana's 1232-byte transaction size means ~3–4 streams per chunk. For teams of 100+, this is 25–33 transactions. If that becomes a bottleneck, a native `create_batch` instruction could pack streams more densely by sharing account references.

**Re-evaluate when:** Teams consistently need >50 streams per batch and the SDK chunking approach causes UX friction.

## Post-creation modification

**What:** Ability to modify stream parameters (amount, duration, cliff, recipient) after creation without destroying and recreating the stream.

**Why deferred:** The RESEARCH.md identified this as a market gap — no existing Solana vesting protocol supports schedule modification. It requires careful design to prevent abuse (e.g., a creator extending the cliff after the recipient has already served their time). The current design is immutable-by-default: what you create is what you get.

**Re-evaluate when:** User research consistently shows post-creation modification as a blocking feature, or when a specific modification use case is well-defined (e.g., extend duration only, never shorten).

## Token-2022 transfer-hook support

**What:** Allow stream creation for Token-2022 mints with transfer-hook extensions by routing transfers through the hook.

**Why deferred:** Transfer hooks can gate, modify, or block token transfers via CPI. Supporting them requires the program to call the transfer-hook program as part of the transfer CPI chain, which adds complexity and failure modes. MVP rejects such tokens at creation time with `TokenHasTransferHook`.

**Re-evaluate when:** Token-2022 adoption grows and transfer-hook tokens become common enough that rejecting them limits adoption.

## Rent return on `withdraw` without completion

**What:** Currently, rent is returned only when accounts close (completion or cancel). An active stream's rent stays locked. If the creator wants to close early without triggering cancellation logic, there's no mechanism.

**Why deferred:** An active stream implies the recipient still has claims to make. Closing the stream while tokens remain would require either returning remaining tokens to the creator (cancellation) or transferring them to the recipient in full (acceleration). Both are distinct operations that warrant their own design.

**Re-evaluate when:** A clear use case emerges for partial rent return or early termination without the full cancel semantics.
