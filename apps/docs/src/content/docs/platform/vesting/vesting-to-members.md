---
title: "Vesting to Members"
description: "Create vesting streams to distribute tokens to organization members."
sidebar:
  label: "Vesting to Members"
---

Vesting to members creates an on-chain vesting stream that distributes your organization's
equity token to a recipient over time.

## Vesting types

SimplyVest supports three types of vesting:

| Type          | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| **Linear**    | Tokens unlock continuously from start to end date                                 |
| **Cliff**     | Tokens unlock all at once after a cliff period, then linear                       |
| **Milestone** | All tokens unlock when a milestone condition is met, gated by a trigger authority |

## How to vest

1. Go to your organization dashboard
2. Click **Vest to Member** on the token card
3. Fill in the details:
   - **Recipient** — the member's wallet address
   - **Amount** — the total amount of tokens to vest
   - **Duration** — the vesting period (e.g., 1 year, 2 years, 4 years)
   - **Cliff** — optional, a period before which no tokens are claimable
   - **Type** — linear, cliff, or milestone
4. Sign the transaction with your wallet

## What happens on-chain

When you vest to a member, the platform:

1. Creates a **StreamAccount** PDA on Solana with the vesting parameters
2. Transfers the total amount of tokens into a **VaultAccount** (PDA token account)
3. Records the stream in the API for fast querying

The tokens are now in a program-derived escrow. Neither you nor the platform can
move them — only the program can release them according to the vesting schedule.

## After vesting

The recipient can:

- View their vesting stream on the claim dashboard
- Claim vested tokens at any time
- Track their vesting progress

You can:

- View all vesting streams on the org dashboard
- Cancel a stream (unvested tokens are refunded)
- Track total vested vs claimed amounts
