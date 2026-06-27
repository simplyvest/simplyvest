---
title: "Troubleshooting & FAQ"
description: "Common issues, error messages, and solutions."
sidebar:
  label: "Troubleshooting & FAQ"
---

## Common Issues

### Transaction fails with "0x1771" or "6000-series" error

These are Anchor program error codes mapped to specific validation failures:

| Code | Name                | Cause                                  | Fix                                                              |
| ---- | ------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| 6000 | ZeroAmount          | Amount must be greater than zero       | Enter a positive token amount                                    |
| 6001 | InvalidTimeRange    | end_time is before start_time          | Check your vesting duration                                      |
| 6003 | DurationTooShort    | Duration less than 60 seconds          | Set a longer vesting period                                      |
| 6004 | InsufficientBalance | Creator's token balance is too low     | Fund your token account first                                    |
| 6007 | CliffNotReached     | Cliff time hasn't passed yet           | Wait until the cliff date                                        |
| 6008 | NothingToWithdraw   | No tokens available to claim           | Wait for more tokens to vest                                     |
| 6011 | StartTimeInPast     | Start time must be in the future       | Set start time at least 60s from now                             |
| 6013 | ExceedsClaimable    | Requested amount exceeds what's vested | Use the claimable amount shown                                   |
| 6014 | Unauthorized        | Wrong wallet is signing                | Use the correct wallet (creator for cancel, recipient for claim) |
| 6012 | StreamExpired       | Trying to cancel after vesting ended   | Use withdraw instead (stream is fully vested)                    |

### "Insufficient SOL for transaction fee"

Solana transactions require a small amount of SOL for fees (~0.000005 SOL). If your wallet has no SOL:

- **Devnet**: Use the [Solana faucet](https://faucet.solana.com/) to get free devnet SOL
- **Mainnet**: Purchase SOL from an exchange and transfer it to your wallet

### "Cannot find stream" when claiming

The stream may have been cancelled or fully claimed. Check the stream status on your dashboard. If it shows "Completed" or "Cancelled", all available tokens have been distributed.

### Wallet not connecting

- Make sure you have a Solana wallet extension installed (Phantom, Backpack, or Solflare)
- Check that the wallet is unlocked
- Try refreshing the page
- If using a browser that blocks popups, allow popups for the SimplyVest domain

### "Token not found in wallet" after claiming

- Claimed tokens may take a few seconds to appear
- In Phantom: click the token list refresh icon or search for the mint address
- In Backpack: tokens appear automatically
- If the token still doesn't appear, you can add the mint address manually

## Frequently Asked Questions

### What happens when a stream is cancelled?

The creator stops the stream. Vested tokens (up to the cancellation moment) are yours to claim. Unvested tokens go back to the creator.

### Can I claim tokens if the stream is cancelled?

Yes. Any tokens that vested before cancellation are still claimable.

### How long do transactions take?

Solana confirms transactions in 2–5 seconds. You may need to wait a few more seconds for the dashboard to refresh.

### Is there a fee to use SimplyVest?

There is no platform fee for MVP. You only pay Solana transaction fees (a few hundred lamports per transaction).

### Can I claim on behalf of someone else?

No. Only the designated recipient wallet can claim tokens from a vesting stream.

### What tokens can be vested?

Any SPL Token or Token-2022 mint (except Token-2022 mints with transfer-hook extensions, which are currently unsupported).

### How do I know if a milestone has been reached?

Check the stream status on your dashboard. If it shows "Ready to Claim" (milestone streams), the milestone has been triggered by the authority.
