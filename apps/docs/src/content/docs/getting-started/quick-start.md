---
title: "Quick Start"
description: "Create an organization, add a token, and vest to a member — in about 5 minutes."
sidebar:
  label: "Quick Start"
---

Get up and running with SimplyVest in three steps.

## Prerequisites

- A Solana wallet (e.g., [Phantom](https://phantom.app/) or [Backpack](https://backpack.app/))
- Some SOL for transaction fees (devnet SOL works too)
- A web browser

## Step 1: Create an organization

1. Go to the [SimplyVest app](https://app.simplyvest.com) and sign in with your Solana wallet
2. Click **Create Organization**
3. Enter a name (e.g., "Acme Corp") and a slug (e.g., "acme")
4. Add a short description

Your organization is now created. You're automatically the **owner**.

## Step 2: Add a token

1. On your organization dashboard, click **Create Token** or **Link Existing Token**
2. If creating: enter name, symbol, decimals, and total supply
3. If linking: enter the mint address of an existing SPL token
4. Sign the transaction with your wallet

Your organization now has an equity token attached.

## Step 3: Vest to a member

1. On your organization dashboard, click **Vest to Member**
2. Enter the recipient's wallet address
3. Set the amount of tokens to vest
4. Choose the vesting schedule:
   - **Linear** — tokens unlock continuously over time
   - **Cliff** — tokens unlock after a set period
   - **Milestone** — tokens unlock when a condition is met
5. Set the duration (e.g., 1 year, 2 years)
6. Sign the transaction

The member can now claim their vested tokens from the claim dashboard.

## Next steps

- Learn more about [organizations](/platform/organizations/creating/)
- Explore [token management](/platform/tokens/creating/)
- Understand [vesting schedules](/platform/vesting/vesting-to-members/)
