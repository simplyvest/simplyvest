---
title: "Claiming Your Tokens"
description: "How to view, claim, and track your vested tokens as a recipient."
sidebar:
  label: "Claiming Tokens"
---

If someone has vested tokens to you, this guide shows how to claim them.

## Prerequisites

- A Solana wallet (e.g., [Phantom](https://phantom.app/) or [Backpack](https://backpack.app/))
- Some SOL for transaction fees (a small amount — typically less than 0.001 SOL per claim)

## Step 1: Connect your wallet

1. Go to the [SimplyVest app](https://app.simplyvest.com)
2. Click **Sign In** and connect your Solana wallet
3. If you're using an embedded wallet (email/social login), you may need to fund it with a small amount of SOL

## Step 2: View your vesting streams

Once connected, your dashboard shows:

- **Active vests** — streams where tokens are currently vesting
- **Claimable amount** — how many tokens are available to claim right now
- **Vesting progress** — a visual progress bar for each stream
- **Total vested** — the full amount allocated to you

## Step 3: Claim tokens

1. On a vesting stream, click **Claim**
2. Review the claimable amount (you can claim all or a partial amount)
3. Sign the transaction with your wallet
4. Wait for confirmation (Solana confirms in ~2–5 seconds)

The claimed tokens will appear in your wallet's token balance.

### Linear vesting

Tokens unlock continuously over time. You can claim multiple times as more tokens vest.

### Cliff vesting

No tokens are claimable until the cliff date passes. After the cliff, tokens vest linearly. You may see "Cliff not reached" until that date.

### Milestone vesting

Tokens unlock all at once when the milestone is triggered by the designated authority. You cannot claim before the milestone is reached.

## Understanding stream status

| Status        | Meaning                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Active**    | Tokens are vesting. You can claim whatever has vested so far.                                                    |
| **Completed** | All tokens have been claimed. The stream is closed.                                                              |
| **Cancelled** | The creator stopped the stream early. Vested tokens are yours to claim; unvested tokens returned to the creator. |

## FAQ

### Why can't I claim?

Possible reasons:

- **Cliff not reached** — check the cliff date on the stream
- **Nothing vested yet** — the stream may have just started
- **Stream cancelled** — you can still claim whatever vested before cancellation
- **Already fully claimed** — check the claimed amount

### Where do my claimed tokens go?

They go directly to your connected Solana wallet. If you don't have a token account for that mint, one is created automatically when you claim.

### Can I claim a partial amount?

Yes. You can claim less than the full claimable amount. This is useful if you want to leave some tokens vesting for later.
