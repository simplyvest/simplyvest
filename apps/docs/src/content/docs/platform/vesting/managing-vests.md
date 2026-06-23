---
title: "Managing Vests"
description: "View, track, and manage vesting streams in your organization."
sidebar:
  label: "Managing Vests"
---

Your organization dashboard shows all vesting streams in one place.

## Stream list

The **Vesting List** table shows:

- **Recipient** — who the tokens are being vested to
- **Amount** — total amount being vested
- **Claimed** — how much has been claimed so far
- **Progress** — visual progress bar
- **Status** — active, completed, cancelled, or expired

## Cancelling a stream

Only the organization owner can cancel a vesting stream.

When you cancel:

- The unvested portion is returned to your wallet
- The vested portion remains claimable by the recipient
- The stream is marked as cancelled

To cancel:

1. Find the stream in the vesting list
2. Click the action menu
3. Select **Cancel Stream**
4. Sign the transaction

## Stream lifecycle

```
Created → Active → Completed (all tokens claimed)
                → Cancelled (owner stopped early)
                → Expired (time passed, tokens unclaimed)
```

- **Active** — tokens are vesting and can be claimed
- **Completed** — all tokens have been claimed
- **Cancelled** — owner cancelled, unvested tokens returned
- **Expired** — the vesting end date passed with unclaimed tokens

## Stats

The organization dashboard shows:

- **Active Vests** — number of currently active streams
- **Total Vested** — sum of all tokens being vested
- **Total Claimed** — sum of all tokens claimed so far

These stats help you track the overall equity distribution at a glance.
