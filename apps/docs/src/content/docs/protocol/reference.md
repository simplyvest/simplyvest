---
title: "Program Reference"
description: "Complete reference for every program instruction: parameters, accounts, validation, errors, events, and TypeScript examples."
sidebar:
  label: "Program Reference"
---

# Program Reference — Solana TDP

Complete reference for every on-chain instruction: parameters, account inputs, validation rules, error codes, events, and working TypeScript examples.

**Program ID (devnet):** `6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk`

## Contents

1. [Account Types](#account-types)
2. [PDA Seeds](#pda-seeds)
3. [Instructions](#instructions)
   - [create_stream](#create_stream)
   - [withdraw](#withdraw)
   - [cancel](#cancel)
   - [create_milestone_stream](#create_milestone_stream)
   - [trigger_milestone](#trigger_milestone)
   - [withdraw_milestone](#withdraw_milestone)
   - [cancel_milestone](#cancel_milestone)
4. [Error Reference](#error-reference)
5. [Event Reference](#event-reference)

---

## Account Types

### StreamAccount

Created on `create_stream`, closed on final `withdraw` or `cancel`.

| Field              | Type     | Description                             |
| ------------------ | -------- | --------------------------------------- |
| `creator`          | `Pubkey` | Wallet that funded the stream           |
| `recipient`        | `Pubkey` | Wallet that receives vested tokens      |
| `mint`             | `Pubkey` | SPL Token mint address                  |
| `vault`            | `Pubkey` | Escrow token account PDA                |
| `amount`           | `u64`    | Total tokens locked                     |
| `amount_withdrawn` | `u64`    | Tokens claimed so far                   |
| `start_time`       | `i64`    | Unix timestamp when vesting begins      |
| `end_time`         | `i64`    | Unix timestamp when fully vested        |
| `cliff_time`       | `i64`    | Unix timestamp of cliff (0 = no cliff)  |
| `vesting_count`    | `u64`    | Nonce for PDA uniqueness                |
| `cancelled`        | `bool`   | Whether stream was cancelled by creator |
| `bump`             | `u8`     | Stream PDA bump seed                    |
| `vault_bump`       | `u8`     | Vault PDA bump seed                     |

**Size:** 187 bytes

### MilestoneStreamAccount

Created on `create_milestone_stream`, closed on `withdraw_milestone` or `cancel_milestone`.

| Field                 | Type     | Description                             |
| --------------------- | -------- | --------------------------------------- |
| `creator`             | `Pubkey` | Wallet that funded the stream           |
| `recipient`           | `Pubkey` | Wallet that receives vested tokens      |
| `mint`                | `Pubkey` | SPL Token mint address                  |
| `vault`               | `Pubkey` | Escrow token account PDA                |
| `amount`              | `u64`    | Total tokens locked                     |
| `amount_withdrawn`    | `u64`    | Tokens claimed so far                   |
| `milestone_authority` | `Pubkey` | Wallet authorized to trigger milestone  |
| `milestone_reached`   | `bool`   | Whether milestone has been triggered    |
| `cancelled`           | `bool`   | Whether stream was cancelled by creator |
| `vesting_count`       | `u64`    | Nonce for PDA uniqueness                |
| `bump`                | `u8`     | MilestoneStream PDA bump seed           |
| `vault_bump`          | `u8`     | Vault PDA bump seed                     |

**Size:** 196 bytes

### CreatorConfig

One per creator wallet, lazily created. Tracks the next sequential nonce.

| Field           | Type     | Description                         |
| --------------- | -------- | ----------------------------------- |
| `creator`       | `Pubkey` | Creator wallet address              |
| `vesting_count` | `u64`    | Next sequential nonce (starts at 0) |

**Size:** 48 bytes

### Vault (Token Account)

Custom PDA token account with the stream PDA as authority.

| Field       | Type     | Description                   |
| ----------- | -------- | ----------------------------- |
| `mint`      | `Pubkey` | SPL Token mint                |
| `amount`    | `u64`    | Tokens held in escrow         |
| `authority` | `Pubkey` | Stream or MilestoneStream PDA |

---

## PDA Seeds

| PDA               | Seeds                                                           | Notes                    |
| ----------------- | --------------------------------------------------------------- | ------------------------ |
| `CreatorConfig`   | `["creator_config", creator]`                                   | One per creator          |
| `StreamAccount`   | `["stream", creator, recipient, mint, vesting_count]`           | Nonce from CreatorConfig |
| `Vault`           | `["vault", stream.key()]`                                       | Escrow token account     |
| `MilestoneStream` | `["milestone-stream", creator, recipient, mint, vesting_count]` | Nonce from CreatorConfig |

### TypeScript Derivation

```ts
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  PROGRAM_ID,
  getStreamPda,
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
} from "@solana-tdp/sdk";

const creator = new PublicKey("...");
const recipient = new PublicKey("...");
const mint = new PublicKey("...");
const vestingCount = new BN(0);

const [streamPDA, bump] = getStreamPda(creator, recipient, mint, vestingCount, PROGRAM_ID);
const [vaultPDA, vaultBump] = getVaultPda(streamPDA, PROGRAM_ID);
const [configPDA] = getCreatorConfigPda(creator, PROGRAM_ID);
const [milestonePDA] = getMilestoneStreamPda(creator, recipient, mint, vestingCount, PROGRAM_ID);
```

---

## Instructions

### create_stream

Initialize a new time-based vesting stream. Tokens transfer from creator's token account into a vault PDA.

**Caller:** Creator (must sign)

**Parameters:**

| Name         | Type  | Description                            |
| ------------ | ----- | -------------------------------------- |
| `amount`     | `u64` | Total tokens to lock in the stream     |
| `start_time` | `i64` | Unix timestamp when vesting begins     |
| `end_time`   | `i64` | Unix timestamp when fully vested       |
| `cliff_time` | `i64` | Unix timestamp of cliff (0 = no cliff) |

**Accounts:**

| Name             | Writable | Signer | Description                        |
| ---------------- | -------- | ------ | ---------------------------------- |
| `sender`         | yes      | yes    | Creator's wallet                   |
| `recipient`      | no       | no     | Recipient's wallet                 |
| `mint`           | no       | no     | SPL Token mint                     |
| `creator_config` | yes      | no     | CreatorConfig PDA (init_if_needed) |
| `stream`         | yes      | no     | StreamAccount PDA (init)           |
| `vault`          | yes      | no     | Vault token account PDA (init)     |
| `sender_token`   | yes      | no     | Creator's token account            |
| `token_program`  | no       | no     | Token program                      |
| `system_program` | no       | no     | System program                     |
| `rent`           | no       | no     | Rent sysvar                        |

**Validation:**

| Condition                                                                  | Error                     |
| -------------------------------------------------------------------------- | ------------------------- |
| `amount == 0`                                                              | `ZeroAmount`              |
| `end_time <= start_time`                                                   | `InvalidTimeRange`        |
| `cliff_time != 0 && (cliff_time <= start_time \|\| cliff_time > end_time)` | `InvalidCliffTime`        |
| `end_time - start_time < 60`                                               | `DurationTooShort`        |
| Creator token balance < `amount`                                           | `InsufficientBalance`     |
| `start_time <= clock.unix_timestamp`                                       | `StartTimeInPast`         |
| Mint owner not SPL Token or Token-2022                                     | `UnsupportedTokenProgram` |
| Token-2022 mint has transfer-hook extension                                | `TokenHasTransferHook`    |

**Events:** `StreamCreated`

**Example:**

```ts
import { BN, Program } from "@coral-xyz/anchor";
import { Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";

async function createStream(
  program: Program<SolanaTdp>,
  creator: Keypair,
  recipient: PublicKey,
  mint: PublicKey,
  amount: number,
  startTime: number,
  endTime: number,
  cliffTime: number,
) {
  const [streamPDA] = getStreamPda(creator.publicKey, recipient, mint, new BN(0), PROGRAM_ID);
  const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
  const [configPDA] = getCreatorConfigPda(creator.publicKey, PROGRAM_ID);
  const senderToken = getAssociatedTokenAddressSync(mint, creator.publicKey);

  const accounts = getCreateStreamAccounts(
    creator.publicKey,
    recipient,
    mint,
    streamPDA,
    vaultPDA,
    senderToken,
    configPDA,
  );

  const tx = await program.methods
    .createStream({
      amount: new BN(amount),
      startTime: new BN(startTime),
      endTime: new BN(endTime),
      cliffTime: new BN(cliffTime),
    })
    .accountsPartial(accounts)
    .transaction();

  const txSig = await program.provider.sendAndConfirm(tx, [creator]);
  return { txSig, streamPDA, vaultPDA };
}
```

---

### withdraw

Let the recipient claim a specific amount of vested tokens. Calculates claimable amount based on current clock time and the vesting curve.

**Caller:** Recipient (must sign)

**Parameters:**

| Name     | Type  | Description                                    |
| -------- | ----- | ---------------------------------------------- |
| `amount` | `u64` | Amount to claim (must be > 0 and <= claimable) |

**Accounts:**

| Name                       | Writable | Signer | Description                      |
| -------------------------- | -------- | ------ | -------------------------------- |
| `recipient`                | yes      | yes    | Recipient's wallet               |
| `stream`                   | yes      | no     | StreamAccount PDA                |
| `vault`                    | yes      | no     | Vault token account PDA          |
| `recipient_token`          | yes      | no     | Recipient's ATA (init_if_needed) |
| `sender`                   | yes      | no     | Creator's wallet (rent return)   |
| `mint`                     | no       | no     | SPL Token mint                   |
| `token_program`            | no       | no     | Token program                    |
| `associated_token_program` | no       | no     | Associated Token program         |
| `system_program`           | no       | no     | System program                   |

**Validation:**

| Condition                           | Error               |
| ----------------------------------- | ------------------- |
| Stream is cancelled                 | `AlreadyCancelled`  |
| `clock.unix_timestamp < cliff_time` | `CliffNotReached`   |
| `amount == 0`                       | `ZeroAmount`        |
| Calculated claimable == 0           | `NothingToWithdraw` |
| `amount > claimable`                | `ExceedsClaimable`  |

**Vesting formula:**

```
if clock < cliff_time:  claimable = 0
else:
  elapsed = clock - start_time
  duration = end_time - start_time
  vested = min(amount * elapsed / duration, amount)
  claimable = vested - amount_withdrawn
```

**Events:** `TokensClaimed` (always), `StreamCompleted` (on final withdrawal)

**Example:**

```ts
import { BN } from "@coral-xyz/anchor";
import { getWithdrawAccounts, getClaimable, fetchStream } from "@solana-tdp/sdk";

async function withdraw(
  program: Program<SolanaTdp>,
  recipient: Keypair,
  creator: PublicKey,
  streamPDA: PublicKey,
  vaultPDA: PublicKey,
  mint: PublicKey,
) {
  const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey);

  // Optional: query the stream to compute claimable
  const stream = await fetchStream(program.provider.connection, streamPDA);
  const clock = await program.provider.connection.getBlockTime(
    await program.provider.connection.getSlot(),
  );
  const claimable = getClaimable(stream!.account, clock);
  console.log(`Claimable: ${claimable.toString()}`);

  // Withdraw the full claimable amount
  const accounts = getWithdrawAccounts(
    recipient.publicKey,
    streamPDA,
    vaultPDA,
    recipientToken,
    creator,
    mint,
  );

  const tx = await program.methods
    .withdraw({ amount: claimable })
    .accountsPartial(accounts)
    .transaction();

  const txSig = await program.provider.sendAndConfirm(tx, [recipient]);
  return txSig;
}
```

---

### cancel

Let the creator cancel an active stream. Recipient receives vested (including unclaimed) tokens, creator receives the unvested portion. Both accounts are closed.

**Caller:** Creator (must sign)

**Parameters:** none

**Accounts:**

| Name                       | Writable | Signer | Description                      |
| -------------------------- | -------- | ------ | -------------------------------- |
| `sender`                   | yes      | yes    | Creator's wallet                 |
| `recipient`                | no       | no     | Recipient's wallet               |
| `stream`                   | yes      | no     | StreamAccount PDA                |
| `vault`                    | yes      | no     | Vault token account PDA          |
| `sender_token`             | yes      | no     | Creator's token account          |
| `recipient_token`          | yes      | no     | Recipient's ATA (init_if_needed) |
| `mint`                     | no       | no     | SPL Token mint                   |
| `token_program`            | no       | no     | Token program                    |
| `associated_token_program` | no       | no     | Associated Token program         |
| `system_program`           | no       | no     | System program                   |

**Validation:**

| Condition                          | Error              |
| ---------------------------------- | ------------------ |
| Caller is not the creator          | `Unauthorized`     |
| Stream is already cancelled        | `AlreadyCancelled` |
| `clock.unix_timestamp >= end_time` | `StreamExpired`    |

**Split logic:**

```
vested = calculate_vested(clock)
recipient_share = vested - amount_withdrawn
creator_share = amount - vested
```

Creator pays for recipient's ATA creation if it doesn't exist.

**Events:** `StreamCancelled`

**Example:**

```ts
import { getCancelAccounts } from "@solana-tdp/sdk";

async function cancelStream(
  program: Program<SolanaTdp>,
  creator: Keypair,
  recipient: PublicKey,
  streamPDA: PublicKey,
  vaultPDA: PublicKey,
  mint: PublicKey,
) {
  const senderToken = getAssociatedTokenAddressSync(mint, creator.publicKey);
  const recipientToken = getAssociatedTokenAddressSync(mint, recipient);

  const accounts = getCancelAccounts(
    creator.publicKey,
    recipient,
    streamPDA,
    vaultPDA,
    senderToken,
    recipientToken,
    mint,
  );

  const tx = await program.methods.cancel().accountsPartial(accounts).transaction();

  const txSig = await program.provider.sendAndConfirm(tx, [creator]);
  return txSig;
}
```

---

### create_milestone_stream

Initialize a new milestone-gated vesting stream. No time parameters — withdrawal is gated by a milestone authority triggering release. Full amount is released at once.

**Caller:** Creator (must sign)

**Parameters:**

| Name     | Type  | Description                        |
| -------- | ----- | ---------------------------------- |
| `amount` | `u64` | Total tokens to lock in the stream |

**Accounts:**

| Name                  | Writable | Signer | Description                          |
| --------------------- | -------- | ------ | ------------------------------------ |
| `sender`              | yes      | yes    | Creator's wallet                     |
| `recipient`           | no       | no     | Recipient's wallet                   |
| `milestone_authority` | no       | no     | Authority that can trigger milestone |
| `creator_config`      | yes      | no     | CreatorConfig PDA (init_if_needed)   |
| `stream`              | yes      | no     | MilestoneStreamAccount PDA (init)    |
| `vault`               | yes      | no     | Vault token account PDA (init)       |
| `sender_token`        | yes      | no     | Creator's token account              |
| `mint`                | no       | no     | SPL Token mint                       |
| `token_program`       | no       | no     | Token program                        |
| `system_program`      | no       | no     | System program                       |
| `rent`                | no       | no     | Rent sysvar                          |

**Validation:**

| Condition                                   | Error                     |
| ------------------------------------------- | ------------------------- |
| `amount == 0`                               | `ZeroAmount`              |
| Creator token balance < `amount`            | `InsufficientBalance`     |
| Mint owner not SPL Token or Token-2022      | `UnsupportedTokenProgram` |
| Token-2022 mint has transfer-hook extension | `TokenHasTransferHook`    |

**Events:** `MilestoneStreamCreated`

**Example:**

```ts
import { BN } from "@coral-xyz/anchor";
import {
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateMilestoneStreamAccounts,
  PROGRAM_ID,
} from "@solana-tdp/sdk";

async function createMilestoneStream(
  program: Program<SolanaTdp>,
  creator: Keypair,
  recipient: PublicKey,
  milestoneAuthority: PublicKey,
  mint: PublicKey,
  amount: number,
) {
  const [streamPDA] = getMilestoneStreamPda(
    creator.publicKey,
    recipient,
    mint,
    new BN(0),
    PROGRAM_ID,
  );
  const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
  const [configPDA] = getCreatorConfigPda(creator.publicKey, PROGRAM_ID);
  const senderToken = getAssociatedTokenAddressSync(mint, creator.publicKey);

  const accounts = getCreateMilestoneStreamAccounts(
    creator.publicKey,
    recipient,
    milestoneAuthority,
    configPDA,
    streamPDA,
    vaultPDA,
    senderToken,
    mint,
  );

  const tx = await program.methods
    .createMilestoneStream({ amount: new BN(amount) })
    .accountsPartial(accounts)
    .transaction();

  const txSig = await program.provider.sendAndConfirm(tx, [creator]);
  return { txSig, streamPDA, vaultPDA };
}
```

---

### trigger_milestone

Let the milestone authority mark a milestone stream as reached. Once triggered, the recipient can withdraw all tokens. One-way operation — cannot be undone.

**Caller:** MilestoneAuthority (must sign)

**Parameters:** none

**Accounts:**

| Name                  | Writable | Signer | Description                        |
| --------------------- | -------- | ------ | ---------------------------------- |
| `milestone_authority` | no       | yes    | The designated milestone authority |
| `stream`              | yes      | no     | MilestoneStreamAccount PDA         |

**Validation:**

| Condition                           | Error              |
| ----------------------------------- | ------------------ |
| Caller is not `milestone_authority` | `Unauthorized`     |
| Status is Cancelled                 | `AlreadyCancelled` |
| `milestone_reached == true`         | `FullyVested`      |

**Events:** `MilestoneTriggered`

**Example:**

```ts
import { getTriggerMilestoneAccounts } from "@solana-tdp/sdk";

async function triggerMilestone(
  program: Program<SolanaTdp>,
  milestoneAuthority: Keypair,
  streamPDA: PublicKey,
) {
  const accounts = getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA);

  const tx = await program.methods.triggerMilestone().accountsPartial(accounts).transaction();

  const txSig = await program.provider.sendAndConfirm(tx, [milestoneAuthority]);
  return txSig;
}
```

---

### withdraw_milestone

Let the recipient withdraw the full stream amount after the milestone has been triggered.

**Caller:** Recipient (must sign)

**Parameters:** none

**Accounts:**

| Name                       | Writable | Signer | Description                      |
| -------------------------- | -------- | ------ | -------------------------------- |
| `recipient`                | yes      | yes    | Recipient's wallet               |
| `stream`                   | yes      | no     | MilestoneStreamAccount PDA       |
| `vault`                    | yes      | no     | Vault token account PDA          |
| `recipient_token`          | yes      | no     | Recipient's ATA (init_if_needed) |
| `sender`                   | yes      | no     | Creator's wallet (rent return)   |
| `mint`                     | no       | no     | SPL Token mint                   |
| `token_program`            | no       | no     | Token program                    |
| `associated_token_program` | no       | no     | Associated Token program         |
| `system_program`           | no       | no     | System program                   |

**Validation:**

| Condition                    | Error               |
| ---------------------------- | ------------------- |
| Status is Cancelled          | `AlreadyCancelled`  |
| `milestone_reached == false` | `NothingToWithdraw` |
| `amount_withdrawn > 0`       | `FullyVested`       |

**Events:** `MilestoneCompleted`

**Example:**

```ts
import { getWithdrawMilestoneAccounts } from "@solana-tdp/sdk";

async function withdrawMilestone(
  program: Program<SolanaTdp>,
  recipient: Keypair,
  creator: PublicKey,
  streamPDA: PublicKey,
  vaultPDA: PublicKey,
  mint: PublicKey,
) {
  const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey);

  const accounts = getWithdrawMilestoneAccounts(
    recipient.publicKey,
    streamPDA,
    vaultPDA,
    recipientToken,
    creator,
    mint,
  );

  const tx = await program.methods.withdrawMilestone().accountsPartial(accounts).transaction();

  const txSig = await program.provider.sendAndConfirm(tx, [recipient]);
  return txSig;
}
```

---

### cancel_milestone

Let the creator cancel a milestone stream before the milestone is triggered. Creator receives the full amount back.

**Caller:** Creator (must sign)

**Parameters:** none

**Accounts:**

| Name                       | Writable | Signer | Description                |
| -------------------------- | -------- | ------ | -------------------------- |
| `sender`                   | yes      | yes    | Creator's wallet           |
| `stream`                   | yes      | no     | MilestoneStreamAccount PDA |
| `vault`                    | yes      | no     | Vault token account PDA    |
| `sender_token`             | yes      | no     | Creator's token account    |
| `mint`                     | no       | no     | SPL Token mint             |
| `token_program`            | no       | no     | Token program              |
| `associated_token_program` | no       | no     | Associated Token program   |
| `system_program`           | no       | no     | System program             |

**Validation:**

| Condition                   | Error              |
| --------------------------- | ------------------ |
| Caller is not the creator   | `Unauthorized`     |
| Status is Cancelled         | `AlreadyCancelled` |
| `milestone_reached == true` | `FullyVested`      |

**Events:** `MilestoneCancelled`

**Example:**

```ts
import { getCancelMilestoneAccounts } from "@solana-tdp/sdk";

async function cancelMilestone(
  program: Program<SolanaTdp>,
  creator: Keypair,
  streamPDA: PublicKey,
  vaultPDA: PublicKey,
  mint: PublicKey,
) {
  const senderToken = getAssociatedTokenAddressSync(mint, creator.publicKey);

  const accounts = getCancelMilestoneAccounts(
    creator.publicKey,
    streamPDA,
    vaultPDA,
    senderToken,
    mint,
  );

  const tx = await program.methods.cancelMilestone().accountsPartial(accounts).transaction();

  const txSig = await program.provider.sendAndConfirm(tx, [creator]);
  return txSig;
}
```

---

## Error Reference

| #   | Code | Name                        | Message                                                  |
| --- | ---- | --------------------------- | -------------------------------------------------------- |
| 0   | 6000 | `ZeroAmount`                | Amount must be greater than zero                         |
| 1   | 6001 | `InvalidTimeRange`          | `start_time` must be before `end_time`                   |
| 2   | 6002 | `InvalidCliffTime`          | `cliff_time` must be between `start_time` and `end_time` |
| 3   | 6003 | `DurationTooShort`          | Stream duration must be at least 60 seconds              |
| 4   | 6004 | `InsufficientBalance`       | Sender does not have enough token balance                |
| 5   | 6005 | `UnsupportedTokenProgram`   | Only SPL Token and Token-2022 are supported              |
| 6   | 6006 | `TokenHasTransferHook`      | Token-2022 mint has transfer-hook extension              |
| 7   | 6007 | `CliffNotReached`           | Cliff time has not been reached yet                      |
| 8   | 6008 | `NothingToWithdraw`         | No tokens available to withdraw                          |
| 9   | 6009 | `AlreadyCancelled`          | Stream is already cancelled                              |
| 10  | 6010 | `FullyVested`               | Milestone reached — no cancel/retrigger allowed          |
| 11  | 6011 | `StartTimeInPast`           | `start_time` must be in the future                       |
| 12  | 6012 | `StreamExpired`             | Cancel after `end_time` — use withdraw instead           |
| 13  | 6013 | `ExceedsClaimable`          | Requested amount exceeds claimable tokens                |
| 14  | 6014 | `Unauthorized`              | Caller is not authorized for this action                 |
| 15  | 6015 | `MilestoneAlreadyTriggered` | Milestone has already been triggered                     |
| 16  | 6016 | `AlreadyWithdrawn`          | Tokens already withdrawn from this milestone             |
| 17  | 6017 | `ArithmeticOverflow`        | Arithmetic overflow in vesting calculation               |

---

## Event Reference

Events are the authoritative on-chain record. Since accounts are closed on completion/cancel, indexers should capture events to reconstruct stream history.

Parse events with the SDK:

```ts
import { parseEvents, findEvent } from "@solana-tdp/sdk";

const events = await parseEvents(program.provider, program, txSig);
const created = findEvent(events, "StreamCreated");
console.log(created.data); // { stream, creator, recipient, mint, amount, ... }
```

### Event Table

| Event                    | Fields                                                                                     | Emitted By                |
| ------------------------ | ------------------------------------------------------------------------------------------ | ------------------------- |
| `StreamCreated`          | `stream`, `creator`, `recipient`, `mint`, `amount`, `start_time`, `cliff_time`, `end_time` | `create_stream`           |
| `TokensClaimed`          | `stream`, `recipient`, `amount`, `claimed`, `total_claimed`                                | `withdraw`                |
| `StreamCompleted`        | `stream`, `recipient`, `total_amount`                                                      | `withdraw` (final)        |
| `StreamCancelled`        | `stream`, `creator`, `recipient`, `vested_to_recipient`, `returned_to_creator`             | `cancel`                  |
| `MilestoneStreamCreated` | `stream`, `creator`, `recipient`, `mint`, `amount`, `milestone_authority`                  | `create_milestone_stream` |
| `MilestoneTriggered`     | `stream`, `milestone_authority`                                                            | `trigger_milestone`       |
| `MilestoneCompleted`     | `stream`, `recipient`, `amount`                                                            | `withdraw_milestone`      |
| `MilestoneCancelled`     | `stream`, `creator`, `recipient`, `returned_to_creator`                                    | `cancel_milestone`        |
