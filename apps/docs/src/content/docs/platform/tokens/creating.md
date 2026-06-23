---
title: "Creating a Token"
description: "Create a new SPL token for your organization's equity."
sidebar:
  label: "Creating a Token"
---

You can create a brand-new SPL token directly from the SimplyVest platform. The token
will be minted on Solana and automatically linked to your organization.

## How to create

1. Go to your organization dashboard
2. Click **Create Token** (shown if no token is attached)
3. Fill in the details:
   - **Name** — the token name (e.g., "Acme Equity")
   - **Symbol** — the ticker symbol (e.g., "ACME")
   - **Decimals** — decimal places (default: 9, matching Solana standard)
   - **Total Supply** — the total number of tokens to mint
   - **Image** — optional token icon (PNG, JPEG, WebP, or SVG)
4. Sign the transaction with your wallet

The platform will:

1. Upload the image (if provided) to IPFS/Arweave
2. Create the token metadata
3. Mint the total supply to your wallet
4. Link the token to your organization

## Token creation costs

Creating a token requires SOL for:

- Token mint account rent exemption
- Metadata account rent exemption
- Transaction fees

On mainnet, this is typically less than 0.01 SOL. On devnet, you can use the
[Solana faucet](https://faucet.solana.com/) to get free devnet SOL.

## Requirements

- You must be the **owner** of the organization
- The organization must not already have a token linked
- Your wallet must have enough SOL for rent and fees

## After creation

Once the token is created:

- It appears on your organization dashboard
- You can [vest it to members](/platform/vesting/vesting-to-members/)
- The token info (name, symbol, mint address) is visible to all org members
