---
title: "Integration Guide"
description: "Step-by-step guide for integrating with the SimplyVest protocol: creating streams, withdrawing, cancelling, and querying."
sidebar:
  label: "Integration Guide"
---

# Integration Guide — Solana TDP

Step-by-step guide for integrating with the Solana Token Distribution Protocol from a TypeScript client. Covers time-based and milestone-gated vesting streams, querying, error handling, and batch creation.

**Target audience:** Developers building on Solana who want to create token vesting streams in their own dApps, bots, or backend services.

## Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Setup](#setup)
4. [Time-Based Vesting](#time-based-vesting)
   - [Creating a Stream](#creating-a-stream)
   - [Withdrawing Tokens](#withdrawing-tokens)
   - [Cancelling a Stream](#cancelling-a-stream)
5. [Milestone-Gated Vesting](#milestone-gated-vesting)
   - [Creating a Milestone Stream](#creating-a-milestone-stream)
   - [Triggering a Milestone](#triggering-a-milestone)
   - [Withdrawing from a Milestone Stream](#withdrawing-from-a-milestone-stream)
   - [Cancelling a Milestone Stream](#cancelling-a-milestone-stream)
6. [Querying Streams](#querying-streams)
7. [Batch Creation](#batch-creation)
8. [Error Handling](#error-handling)
9. [Working with Events](#working-with-events)
10. [Full End-to-End Example](#full-end-to-end-example)

---

## Prerequisites

- **Node.js** v24+ and **pnpm** (or npm/yarn)
- **Solana CLI** v3.1.12+
- A Solana wallet funded with SOL (devnet: airdrop at `faucet.solana.com`)
- An SPL Token mint (can be created with `spl-token create-token`)
- SPL Token balance in your wallet

The examples below target **devnet** but work identically on mainnet with the appropriate RPC URL.

---

## Installation

```bash
pnpm add @solana-tdp/sdk @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

The SDK depends on Anchor 0.32+ and Web3.js v1.98+.

---

## Setup

Create an Anchor `Program` instance with your wallet:

```ts
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { SOLANA_TDP_PROGRAM_IDL, PROGRAM_ID } from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";

// Connect to devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load your wallet (replace with your keypair loading logic)
const wallet = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.WALLET_KEYPAIR!)));

const provider = new AnchorProvider(connection, new Wallet(wallet), {
  commitment: "confirmed",
});

const program = new Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);
```

> **Note:** The SDK exports `buildReadProgram(connection)` for read-only operations that don't need a signer (fetching accounts, PDAs, computed vesting math).

---

## Time-Based Vesting

### Creating a Stream

A time-based stream locks tokens in a vault and releases them linearly over a time range, with an optional cliff.

**Step 1: Derive PDAs**

PDAs are deterministic — you can derive them before sending the transaction. The first stream for a (creator, recipient, mint) triple uses `vesting_count = 0`.

```ts
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getStreamPda, getVaultPda, getCreatorConfigPda } from "@solana-tdp/sdk";

const creator = wallet.publicKey;
const recipient = new PublicKey("RecipientWalletAddress...");
const mint = new PublicKey("TokenMintAddress...");
const vestingCount = new BN(0); // First stream: 0

const [streamPDA, streamBump] = getStreamPda(creator, recipient, mint, vestingCount, PROGRAM_ID);
const [vaultPDA, vaultBump] = getVaultPda(streamPDA, PROGRAM_ID);
const [configPDA] = getCreatorConfigPda(creator, PROGRAM_ID);
```

**Step 2: Prepare time parameters**

All timestamps are Unix seconds. The stream must start in the future, duration must be >= 60 seconds, and cliff must be between start and end (or 0 for no cliff).

```ts
const now = Math.floor(Date.now() / 1000);
const startTime = now + 60; // 1 minute from now
const cliffTime = startTime + 300; // 5-minute cliff after start
const endTime = startTime + 3600; // 1-hour vesting period
const amount = 1_000_000; // Raw token amount (accounting for decimals)
```

**Step 3: Build and send the transaction**

```ts
import { getCreateStreamAccounts } from "@solana-tdp/sdk";

const senderToken = getAssociatedTokenAddressSync(mint, creator);

const accounts = getCreateStreamAccounts(
  creator,
  recipient,
  mint,
  streamPDA,
  vaultPDA,
  senderToken,
  configPDA,
);

const txSig = await program.methods
  .createStream({
    amount: new BN(amount),
    startTime: new BN(startTime),
    endTime: new BN(endTime),
    cliffTime: new BN(cliffTime),
  })
  .accountsPartial(accounts)
  .rpc(); // .rpc() signs and sends with provider.wallet in one call

console.log(`Stream created: ${txSig}`);
console.log(`Stream PDA: ${streamPDA.toBase58()}`);
console.log(`Vault PDA: ${vaultPDA.toBase58()}`);
```

**Step 4: Verify on-chain**

```ts
import { fetchStream } from "@solana-tdp/sdk";

const result = await fetchStream(connection, streamPDA);
if (result) {
  const { account } = result;
  console.log(`Amount: ${account.amount.toString()}`);
  console.log(`Creator: ${account.creator.toBase58()}`);
  console.log(`Recipient: ${account.recipient.toBase58()}`);
  console.log(`Start: ${account.startTime.toString()}`);
  console.log(`Cliff: ${account.cliffTime.toString()}`);
  console.log(`End: ${account.endTime.toString()}`);
}
```

---

### Withdrawing Tokens

Tokens vest linearly over time. Use the SDK's `getClaimable` to compute how much is available.

**Step 1: Check what's claimable**

```ts
import { fetchStream, getClaimable } from "@solana-tdp/sdk";

const stream = await fetchStream(connection, streamPDA);
if (!stream) throw new Error("Stream not found");

const slot = await connection.getSlot();
const clockTime = await connection.getBlockTime(slot);
if (!clockTime) throw new Error("Could not get block time");

const claimable = getClaimable(stream.account, clockTime);
console.log(`Claimable: ${claimable.toString()}`);

if (claimable.isZero()) {
  console.log("Nothing to withdraw yet — cliff or vesting hasn't started");
  return;
}
```

**Step 2: Withdraw**

```ts
import { getWithdrawAccounts } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const recipientToken = getAssociatedTokenAddressSync(mint, recipient);

const accounts = getWithdrawAccounts(
  recipient,
  streamPDA,
  vaultPDA,
  recipientToken,
  creator, // rent return destination
  mint,
);

// Use recipient's wallet as signer
const txSig = await program.methods
  .withdraw({ amount: claimable })
  .accountsPartial(accounts)
  .signers([recipientKeypair]) // recipient must sign!
  .rpc();

console.log(`Withdrew ${claimable.toString()} tokens: ${txSig}`);
```

**Partial withdrawals:** You can withdraw less than the full claimable amount by passing a lower `amount` value. This is useful for claim-and-stake or claim-and-swap patterns.

**Final withdrawal behavior:** When `amount_withdrawn` reaches `amount`, the stream and vault accounts are automatically closed. Rent-exempt SOL is returned to the creator.

---

### Cancelling a Stream

Only the creator can cancel. The recipient receives whatever has vested (including unclaimed). The creator gets the unvested portion back.

```ts
import { getCancelAccounts } from "@solana-tdp/sdk";

const senderToken = getAssociatedTokenAddressSync(mint, creator);
const recipientToken = getAssociatedTokenAddressSync(mint, recipient);

const accounts = getCancelAccounts(
  creator,
  recipient,
  streamPDA,
  vaultPDA,
  senderToken,
  recipientToken,
  mint,
);

const txSig = await program.methods.cancel().accountsPartial(accounts).rpc(); // provider.wallet is the creator, so it signs automatically

console.log(`Stream cancelled: ${txSig}`);
```

**Cannot cancel after `end_time`:** If the stream has fully vested, use `withdraw` instead. Attempting cancel after `end_time` returns error `StreamExpired`.

---

## Milestone-Gated Vesting

Milestone streams skip time-based vesting. A designated authority triggers a one-time release, and the recipient withdraws the full amount. Useful for deliverables, KYC gates, or DAO vote completions.

### Creating a Milestone Stream

```ts
import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateMilestoneStreamAccounts,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const creator = wallet.publicKey;
const recipient = new PublicKey("RecipientWallet...");
const milestoneAuthority = new PublicKey("AuthorityWallet...");
const mint = new PublicKey("TokenMint...");
const amount = 500_000;

const [streamPDA] = getMilestoneStreamPda(creator, recipient, mint, new BN(0), PROGRAM_ID);
const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
const [configPDA] = getCreatorConfigPda(creator, PROGRAM_ID);
const senderToken = getAssociatedTokenAddressSync(mint, creator);

const accounts = getCreateMilestoneStreamAccounts(
  creator,
  recipient,
  milestoneAuthority,
  configPDA,
  streamPDA,
  vaultPDA,
  senderToken,
  mint,
);

const txSig = await program.methods
  .createMilestoneStream({ amount: new BN(amount) })
  .accountsPartial(accounts)
  .rpc();

console.log(`Milestone stream created: ${streamPDA.toBase58()}`);
```

### Triggering a Milestone

The milestone authority must sign this transaction:

```ts
import { getTriggerMilestoneAccounts } from "@solana-tdp/sdk";

const accounts = getTriggerMilestoneAccounts(milestoneAuthority, streamPDA);

const txSig = await program.methods
  .triggerMilestone()
  .accountsPartial(accounts)
  .signers([milestoneAuthorityKeypair]) // must match milestone_authority field
  .rpc();

console.log(`Milestone triggered: ${txSig}`);
```

> **Security note:** Triggering is one-way. Once `milestone_reached` is set to `true`, neither triggering again nor cancelling is possible.

### Withdrawing from a Milestone Stream

After the milestone is triggered, the recipient withdraws the full amount in one transaction:

```ts
import { getWithdrawMilestoneAccounts } from "@solana-tdp/sdk";

const recipientToken = getAssociatedTokenAddressSync(mint, recipient);

const accounts = getWithdrawMilestoneAccounts(
  recipient,
  streamPDA,
  vaultPDA,
  recipientToken,
  creator, // rent return destination
  mint,
);

const txSig = await program.methods
  .withdrawMilestone()
  .accountsPartial(accounts)
  .signers([recipientKeypair])
  .rpc();

console.log(`Milestone withdrawn: ${txSig}`);
```

### Cancelling a Milestone Stream

The creator can cancel only before the milestone is triggered:

```ts
import { getCancelMilestoneAccounts } from "@solana-tdp/sdk";

const senderToken = getAssociatedTokenAddressSync(mint, creator);

const accounts = getCancelMilestoneAccounts(creator, streamPDA, vaultPDA, senderToken, mint);

const txSig = await program.methods.cancelMilestone().accountsPartial(accounts).rpc();

console.log(`Milestone cancelled, tokens returned: ${txSig}`);
```

---

## Querying Streams

The SDK provides fetch functions for all common queries:

```ts
import {
  fetchStreams,
  fetchStreamsByCreator,
  fetchStreamsByRecipient,
  fetchMilestoneStreams,
  fetchMilestoneStreamsByCreator,
  fetchMilestoneStreamsByRecipient,
  fetchCreatorConfig,
  getStatus,
  getClaimable,
  getMilestoneStatus,
} from "@solana-tdp/sdk";

// All time-based streams on the program
const allStreams = await fetchStreams(connection);

// Streams created by a specific wallet
const myStreams = await fetchStreamsByCreator(connection, creator);

// Streams where a specific wallet is the recipient
const incomingStreams = await fetchStreamsByRecipient(connection, recipient);

// Single stream by PDA
const stream = await fetchStream(connection, streamPDA);

// Milestone streams
const milestoneStreams = await fetchMilestoneStreams(connection);

// Creator config (vesting count)
const config = await fetchCreatorConfig(connection, creator);

// Compute stream status (active | completed | cancelled)
const slot = await connection.getSlot();
const clockTime = await connection.getBlockTime(slot);
const status = getStatus(stream!.account, clockTime!);

// Compute claimable amount
const claimable = getClaimable(stream!.account, clockTime!);

// Milestone stream status
const mStatus = getMilestoneStatus(milestoneAccount);
```

> **Performance note:** `fetchStreamsByCreator` and `fetchStreamsByRecipient` use `getProgramAccounts` with `memcmp` filters. For production use with many streams, consider indexing events into a database.

---

## Batch Creation

The on-chain program creates one stream per instruction. To create multiple streams atomically, pack multiple `createStream` instructions into a single transaction:

```ts
import { Transaction } from "@solana/web3.js";

const streams: Array<{
  recipient: PublicKey;
  amount: number;
}> = [
  { recipient: recipient1, amount: 1_000_000 },
  { recipient: recipient2, amount: 500_000 },
  { recipient: recipient3, amount: 2_000_000 },
];

const tx = new Transaction();

// Query the current vesting count to start from
const config = await fetchCreatorConfig(connection, creator);
let count = config ? config.vestingCount : new BN(0);

const startTime = Math.floor(Date.now() / 1000) + 120;
const endTime = startTime + 31_536_000; // 1 year
const senderToken = getAssociatedTokenAddressSync(mint, creator);

for (const { recipient, amount } of streams) {
  const [streamPDA] = getStreamPda(creator, recipient, mint, count, PROGRAM_ID);
  const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
  const [configPDA] = getCreatorConfigPda(creator, PROGRAM_ID);

  const ix = await program.methods
    .createStream({
      amount: new BN(amount),
      startTime: new BN(startTime),
      endTime: new BN(endTime),
      cliffTime: new BN(0), // no cliff
    })
    .accountsPartial(
      getCreateStreamAccounts(
        creator,
        recipient,
        mint,
        streamPDA,
        vaultPDA,
        senderToken,
        configPDA,
      ),
    )
    .instruction();

  tx.add(ix);
  count = count.add(new BN(1));
}

const txSig = await program.provider.sendAndConfirm(tx);
console.log(`Batch of ${streams.length} streams: ${txSig}`);
```

**Transaction size limit:** Solana transactions are limited to 1232 bytes. You can fit approximately 3–4 stream creations per transaction. For larger batches, split into multiple transactions.

**Atomicity:** All instructions in a single transaction execute atomically — either all succeed or none do.

---

## Error Handling

Anchor errors are returned as program error codes in the 6000–6999 range. Handle them in your integration:

```ts
import { AnchorError } from "@coral-xyz/anchor";

async function safeCreateStream(
  program: Program<SolanaTdp>,
  /* ... params */
) {
  try {
    return await program.methods.createStream(/* ... */).accountsPartial(accounts).rpc();
  } catch (err) {
    if (err instanceof AnchorError) {
      switch (err.error.errorCode.number) {
        case 6000:
          throw new Error("Amount must be greater than zero");
        case 6001:
          throw new Error("Start time must be before end time");
        case 6003:
          throw new Error("Stream duration must be at least 60 seconds");
        case 6004:
          throw new Error("Insufficient token balance for this stream");
        case 6007:
          throw new Error("Cliff time has not been reached yet");
        case 6013:
          throw new Error("Requested amount exceeds claimable tokens");
        case 6014:
          throw new Error(
            "Unauthorized — only the stream creator/recipient/authority can call this",
          );
        default:
          throw new Error(`Program error ${err.error.errorCode.number}: ${err.error.errorMessage}`);
      }
    }
    throw err;
  }
}
```

**Common pitfalls:**

| Issue                                 | Cause                                       | Fix                                                                                        |
| ------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `StartTimeInPast` (6011)              | `start_time` is <= current clock time       | Set `start_time` to `now + 60` or later                                                    |
| `DurationTooShort` (6003)             | `end_time - start_time < 60` seconds        | Ensure duration >= 60 seconds                                                              |
| `InsufficientBalance` (6004)          | Creator's token balance < `amount`          | Fund the token account first                                                               |
| `TokenHasTransferHook` (6006)         | Token-2022 mint has transfer-hook extension | Use a standard SPL Token mint without hooks                                                |
| `ExceedsClaimable` (6013)             | Withdraw amount > what's vested             | Use `getClaimable()` to compute the exact amount                                           |
| `Unauthorized` (6014)                 | Wrong signer (wrong wallet signing)         | Check signers: creator for cancel, recipient for withdraw, milestone authority for trigger |
| Transaction simulation fails silently | ATA doesn't exist for recipient             | The program creates ATAs automatically via CPI — no manual ATA creation needed             |

---

## Working with Events

Events are emitted by every instruction and can be parsed from transaction logs:

```ts
import { parseEvents, findEvent } from "@solana-tdp/sdk";

async function getEventsFromTx(txSig: string) {
  const events = await parseEvents(program.provider, program, txSig);

  const streamCreated = findEvent(events, "StreamCreated");
  console.log("Stream:", streamCreated.data.stream.toBase58());
  console.log("Amount:", streamCreated.data.amount.toString());

  return events;
}
```

Events persist on-chain in transaction logs. Since stream accounts are fully closed on completion or cancellation, events are the authoritative source for indexing stream history.

---

## Full End-to-End Example

Complete example: create a stream, wait for vesting, withdraw, and verify:

```ts
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  SOLANA_TDP_PROGRAM_IDL,
  PROGRAM_ID,
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
  getWithdrawAccounts,
  fetchStream,
  getClaimable,
} from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";

async function main() {
  // ── Setup ────────────────────────────────────────────────────
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const creator = loadWallet(); // Your wallet loading logic
  const recipient = new PublicKey("Recipient's wallet address");
  const mint = new PublicKey("SPL token mint address");

  const provider = new AnchorProvider(connection, new Wallet(creator), {
    commitment: "confirmed",
  });
  const program = new Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);

  // ── Derive PDAs ──────────────────────────────────────────────
  const [streamPDA] = getStreamPda(creator.publicKey, recipient, mint, new BN(0), PROGRAM_ID);
  const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
  const [configPDA] = getCreatorConfigPda(creator.publicKey, PROGRAM_ID);
  const senderToken = getAssociatedTokenAddressSync(mint, creator.publicKey);

  // ── Create stream ────────────────────────────────────────────
  const now = Math.floor(Date.now() / 1000);
  const amount = 1_000_000; // 1 token with 6 decimals

  const createAccounts = getCreateStreamAccounts(
    creator.publicKey,
    recipient,
    mint,
    streamPDA,
    vaultPDA,
    senderToken,
    configPDA,
  );

  const createTxSig = await program.methods
    .createStream({
      amount: new BN(amount),
      startTime: new BN(now + 60), // 1 min from now
      endTime: new BN(now + 60 + 3600), // 1 hour duration
      cliffTime: new BN(0), // no cliff
    })
    .accountsPartial(createAccounts)
    .rpc();

  console.log(`Stream created: ${createTxSig}`);

  // ── Wait for vesting ─────────────────────────────────────────
  console.log("Waiting for vesting...");
  // In production: poll connection.getBlockTime(connection.getSlot())
  // until the desired vesting percentage is reached

  // ── Withdraw ─────────────────────────────────────────────────
  const stream = await fetchStream(connection, streamPDA);
  const slot = await connection.getSlot();
  const clockTime = await connection.getBlockTime(slot);
  const claimable = getClaimable(stream!.account, clockTime!);

  console.log(`Claimable: ${claimable.toString()}`);

  const recipientToken = getAssociatedTokenAddressSync(mint, recipient);

  const withdrawAccounts = getWithdrawAccounts(
    recipient,
    streamPDA,
    vaultPDA,
    recipientToken,
    creator.publicKey,
    mint,
  );

  const withdrawTxSig = await program.methods
    .withdraw({ amount: claimable })
    .accountsPartial(withdrawAccounts)
    .rpc();

  console.log(`Withdrawn: ${withdrawTxSig}`);

  // ── Verify ───────────────────────────────────────────────────
  const finalStream = await fetchStream(connection, streamPDA);
  if (finalStream) {
    console.log(`Withdrawn: ${finalStream.account.amountWithdrawn.toString()}`);
    console.log(
      `Remaining: ${finalStream.account.amount.sub(finalStream.account.amountWithdrawn).toString()}`,
    );
  } else {
    console.log("Stream fully claimed — account closed");
  }
}

main().catch(console.error);
```
