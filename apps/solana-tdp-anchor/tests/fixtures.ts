import { BN } from "@coral-xyz/anchor";
import {
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getMilestoneStreamPda,
  getCreateStreamAccounts,
  getCreateMilestoneStreamAccounts,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

import type { SetupTest } from "./utils";

import { clockNow } from "./helpers";
import { createMint, createTokenAccount, mintTo } from "./utils";

// ── Stream fixture ───────────────────────────────────────────────────────────

export const createStreamFixture = async (
  t: Pick<SetupTest, "program" | "provider" | "svmAirdrop" | "svm">,
  amount: number,
  startOffset: number,
  endOffset: number,
  cliffOffset: number,
) => {
  const { program, provider, svmAirdrop, svm } = t;
  const sender = Keypair.generate();
  const recipient = Keypair.generate();
  svmAirdrop([sender.publicKey, recipient.publicKey]);

  const mint = await createMint(provider, sender, sender.publicKey, 6);
  const senderToken = await createTokenAccount(provider, sender, mint, sender.publicKey);
  await mintTo(provider, mint, senderToken, sender, BigInt(amount));

  // Derive ATA address (account won't be created yet — withdraw handler does it)
  const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

  const now = clockNow(svm);
  const start = now + startOffset;
  const cliff = start + cliffOffset;
  const end = start + endOffset;

  const [streamPDA] = getStreamPda(
    sender.publicKey,
    recipient.publicKey,
    mint,
    new BN(0),
    PROGRAM_ID,
  );
  const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
  const [creatorConfigPDA] = getCreatorConfigPda(sender.publicKey, PROGRAM_ID);

  await program.methods
    .createStream({
      amount: new BN(amount),
      startTime: new BN(start),
      endTime: new BN(end),
      cliffTime: new BN(cliff),
    })
    .accountsPartial(
      getCreateStreamAccounts(
        sender.publicKey,
        recipient.publicKey,
        mint,
        streamPDA,
        vaultPDA,
        senderToken,
        creatorConfigPDA,
      ),
    )
    .signers([sender])
    .rpc();

  return {
    sender,
    recipient,
    mint,
    senderToken,
    recipientToken,
    streamPDA,
    vaultPDA,
    amount,
    start,
    cliff,
    end,
  };
};

// ── Milestone stream fixture ──────────────────────────────────────────────────

export const createMilestoneStreamFixture = async (
  t: Pick<SetupTest, "program" | "provider" | "svmAirdrop" | "svm">,
  amount: number,
) => {
  const { program, provider, svmAirdrop } = t;
  const sender = Keypair.generate();
  const recipient = Keypair.generate();
  const milestoneAuthority = Keypair.generate();
  svmAirdrop([sender.publicKey, recipient.publicKey, milestoneAuthority.publicKey]);

  const mint = await createMint(provider, sender, sender.publicKey, 6);
  const senderToken = await createTokenAccount(provider, sender, mint, sender.publicKey);
  await mintTo(provider, mint, senderToken, sender, BigInt(amount));

  const [creatorConfigPDA] = getCreatorConfigPda(sender.publicKey, PROGRAM_ID);
  const [streamPDA] = getMilestoneStreamPda(
    sender.publicKey,
    recipient.publicKey,
    mint,
    new BN(0),
    PROGRAM_ID,
  );
  const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);

  await program.methods
    .createMilestoneStream({ amount: new BN(amount) })
    .accountsPartial(
      getCreateMilestoneStreamAccounts(
        sender.publicKey,
        recipient.publicKey,
        milestoneAuthority.publicKey,
        creatorConfigPDA,
        streamPDA,
        vaultPDA,
        senderToken,
        mint,
      ),
    )
    .signers([sender])
    .rpc();

  return {
    sender,
    recipient,
    milestoneAuthority,
    mint,
    senderToken,
    streamPDA,
    vaultPDA,
    amount,
  };
};
