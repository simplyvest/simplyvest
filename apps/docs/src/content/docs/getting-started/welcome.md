---
title: "Welcome to SimplyVest"
description: "A token equity vesting platform for modern organizations — web2-meets-web3, non-custodial, and built on Solana."
sidebar:
  label: "Welcome"
---

SimplyVest is a **token equity vesting web2/web3 hybrid platform** that makes it easy to create,
manage, and claim token vesting schedules — without spreadsheets or smart contract code.

## What SimplyVest does

Create an organization, add a token (or link an existing one), and vest it to your members. Under
the hood, SimplyVest uses a battle-tested Solana Anchor program for on-chain custody, but you
don't need to know any of that to use it.

### For founders & operators

- **Create organizations** — set up your company or DAO in minutes
- **Create or link tokens** — mint a new equity token or connect an existing SPL token
- **Vest to members** — set up linear, cliff, or milestone-based vesting schedules
- **Track everything** — dashboard with vesting stats, member allocations, and claim history

### For developers

- **Non-custodial protocol** — tokens are secured by a Solana Anchor program using PDAs,
  not by a central party
- **Hybrid architecture** — web2 API for fast queries (D1 database) + web3 on-chain settlement
- **Full SDK** — TypeScript SDK with PDA helpers, event parsing, and instruction builders
- **Open source** — MIT-licensed, contributions welcome

## Platform overview

```
You (Founder/Owner)
      │
      ▼
┌─────────────────┐
│  Organization    │── has members with roles (owner, admin, member)
│  (e.g., "Acme") │── has one equity token (mint)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Token (SPL)    │── created on Solana or linked from an existing mint
│  (e.g., ACME)   │── vesting streams distribute this token to members
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Vesting Streams     │── linear (time-based) or milestone-gated
│  (per member)        │── cliff optional, cancel anytime
└──────────────────────┘
```

## What's next?

Head to the [Quick Start](/getting-started/quick-start/) to create your first organization and
vest a token to a member — it takes about 5 minutes.
