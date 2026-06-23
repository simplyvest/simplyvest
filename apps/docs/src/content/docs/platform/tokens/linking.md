---
title: "Linking an Existing Token"
description: "Link an existing SPL token to your organization as its equity token."
sidebar:
  label: "Linking an Existing Token"
---

If you already have an SPL token, you can link it to your organization instead of
creating a new one.

## How to link

1. Go to your organization dashboard
2. Click **Link Existing Token**
3. A token picker dialog opens with options:
   - **Your wallet tokens** — tokens in your connected wallet
   - **Platform tokens** — tokens previously created on SimplyVest
   - **Common tokens** — popular SPL tokens
   - **Custom mint** — paste any SPL token mint address
4. Select the token you want to link
5. Confirm

## What linking does

Linking a token **associates** it with your organization. It does NOT:

- Transfer any tokens
- Give the platform control over the token
- Create a new token

The token simply becomes the organization's recognized equity token, which you can
then [vest to members](/platform/vesting/vesting-to-members/).

## Re-linking

If you linked the wrong token:

1. Click the **Change** dropdown on the token card
2. Select **Unlink Token**
3. Link a different token

Unlinking does NOT affect existing vesting streams — each stream stores its own
mint address independently.

## Requirements

- You must be the **owner** of the organization
- The organization must not already have a token linked
- The token must exist on Solana (mainnet or devnet)
