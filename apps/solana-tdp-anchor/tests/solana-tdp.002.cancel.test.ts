import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

import {
  findStreamPDA,
  findVaultPDA,
  findCreatorConfigPDA,
  parseEvents,
  findEvent,
} from "./helpers";
import { setupTest, createMint, createTokenAccount, mintTo } from "./utils";

describe("Feature 2: cancel", () => {
  let program: any;
  let svm: any;
  let svmAirdrop: (addresses: PublicKey[]) => void;
  let svmTokenBalance: (pk: PublicKey) => bigint;
  let warp: (seconds: number) => void;
  let provider: any;

  beforeEach(() => {
    ({ program, provider, svm, svmAirdrop, warp, svmTokenBalance } = setupTest());
  });

  // Use SVM clock for time calculations (LiteSVM starts at epoch 0)
  const clockNow = () => Number(svm.getClock().unixTimestamp);

  // Shared accounts for cancel instructions
  const cancelAccounts = (
    sender: PublicKey,
    recipient: PublicKey,
    stream: PublicKey,
    vault: PublicKey,
    senderToken: PublicKey,
    recipientToken: PublicKey,
    mint: PublicKey,
  ) => ({
    sender,
    recipient,
    stream,
    vault,
    senderToken,
    recipientToken,
    mint,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  });

  const setupStream = async (
    amount: number,
    startOffset: number,
    endOffset: number,
    cliffOffset: number,
  ) => {
    const sender = Keypair.generate();
    const recipient = Keypair.generate();
    svmAirdrop([sender.publicKey, recipient.publicKey]);

    const mint = await createMint(provider, sender, sender.publicKey, 6);
    const senderToken = await createTokenAccount(provider, sender, mint, sender.publicKey);
    await mintTo(provider, mint, senderToken, sender, BigInt(amount));

    // Derive recipient's ATA address (cancel handler creates it via init_if_needed)
    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

    const now = clockNow();
    const start = now + startOffset;
    const cliff = start + cliffOffset;
    const end = start + endOffset;

    const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey, mint, new BN(0));
    const [vaultPDA] = await findVaultPDA(streamPDA);
    const [creatorConfigPDA] = await findCreatorConfigPDA(sender.publicKey);

    await program.methods
      .createStream({
        amount: new BN(amount),
        startTime: new BN(start),
        endTime: new BN(end),
        cliffTime: new BN(cliff),
      })
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken,
        mint,
        creatorConfig: creatorConfigPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
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

  it("cancel between start_time and cliff_time returns all to sender", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA, amount } =
      await setupStream(1_000_000, 60, 3600, 120); // cliff = start + 120s
    warp(90); // after start (60), before cliff (120)

    const vaultBefore = svmTokenBalance(vaultPDA);
    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .cancel()
      .accounts(
        cancelAccounts(
          sender.publicKey,
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          senderToken,
          recipientToken,
          mint,
        ),
      )
      .signers([sender])
      .rpc();

    expect(svm.getAccount(vaultPDA)).toBeNull();

    // Nothing vested before cliff — all tokens return to sender
    expect(svmTokenBalance(senderToken)).toBe(senderBefore + vaultBefore);
    expect(svmTokenBalance(recipientToken)).toBe(recipientBefore);
  });

  it("cancel before start_time returns all to sender", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA, amount } =
      await setupStream(1_000_000, 60, 3600, 60);

    const vaultBefore = svmTokenBalance(vaultPDA);
    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .cancel()
      .accounts(
        cancelAccounts(
          sender.publicKey,
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          senderToken,
          recipientToken,
          mint,
        ),
      )
      .signers([sender])
      .rpc();

    // Stream and vault are closed after cancel
    expect(svm.getAccount(vaultPDA)).toBeNull();
    const streamAcc = svm.getAccount(streamPDA);
    if (streamAcc) {
      const data = Buffer.from(streamAcc.data);
      expect(data.every((b: number) => b === 0)).toBe(true);
    }

    // All tokens returned to sender (nothing vested before start)
    expect(svmTokenBalance(senderToken)).toBe(senderBefore + vaultBefore);
    expect(svmTokenBalance(recipientToken)).toBe(recipientBefore);
  });

  it("cancel after partial vesting splits accordingly", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 3600, 10);
    warp(1210); // ~1/3 of vesting elapsed (1200s out of 3600s)

    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);
    const vaultBefore = svmTokenBalance(vaultPDA);

    await program.methods
      .cancel()
      .accounts(
        cancelAccounts(
          sender.publicKey,
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          senderToken,
          recipientToken,
          mint,
        ),
      )
      .signers([sender])
      .rpc();

    expect(svm.getAccount(vaultPDA)).toBeNull();

    const recipientGained = svmTokenBalance(recipientToken) - recipientBefore;
    const senderGained = svmTokenBalance(senderToken) - senderBefore;

    expect(recipientGained).toBeGreaterThan(BigInt(0));
    expect(senderGained).toBeGreaterThan(BigInt(0));
    expect(recipientGained + senderGained).toBe(vaultBefore);
  });

  it("rejects cancel after end_time — use withdraw instead", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 300, 10);
    warp(600); // well past end

    await expect(
      program.methods
        .cancel()
        .accounts(
          cancelAccounts(
            sender.publicKey,
            recipient.publicKey,
            streamPDA,
            vaultPDA,
            senderToken,
            recipientToken,
            mint,
          ),
        )
        .signers([sender])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects if already cancelled", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 3600, 10);
    warp(100);

    // First cancel
    await program.methods
      .cancel()
      .accounts(
        cancelAccounts(
          sender.publicKey,
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          senderToken,
          recipientToken,
          mint,
        ),
      )
      .signers([sender])
      .rpc();

    // Second cancel should fail (stream is closed)
    const promise = program.methods
      .cancel()
      .accounts(
        cancelAccounts(
          sender.publicKey,
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          senderToken,
          recipientToken,
          mint,
        ),
      )
      .signers([sender])
      .rpc();

    await expect(promise).rejects.toThrow();
  });

  it("emits StreamCancelled event", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 3600, 10);
    warp(1210);

    const txSig = await program.methods
      .cancel()
      .accounts(
        cancelAccounts(
          sender.publicKey,
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          senderToken,
          recipientToken,
          mint,
        ),
      )
      .signers([sender])
      .rpc();

    const events = await parseEvents(provider, program, txSig);
    const event = findEvent(events, "streamCancelled");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.creator.toBase58()).toBe(sender.publicKey.toBase58());
    expect(event.data.recipient.toBase58()).toBe(recipient.publicKey.toBase58());
    expect(event.data.vestedToRecipient.toNumber()).toBeGreaterThan(0);
    expect(event.data.returnedToCreator.toNumber()).toBeGreaterThan(0);
    // Full amount is distributed
    expect(event.data.vestedToRecipient.toNumber() + event.data.returnedToCreator.toNumber()).toBe(
      1_000_000,
    );
  });

  it("closes vault and stream on cancel", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 3600, 10);
    warp(100);
    const senderBefore = svm.getBalance(sender.publicKey);

    await program.methods
      .cancel()
      .accounts(
        cancelAccounts(
          sender.publicKey,
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          senderToken,
          recipientToken,
          mint,
        ),
      )
      .signers([sender])
      .rpc();

    // Vault closed
    expect(svm.getAccount(vaultPDA)).toBeNull();

    // Stream closed (zeroed or purged)
    const streamAccount = svm.getAccount(streamPDA);
    if (streamAccount) {
      const data = Buffer.from(streamAccount.data);
      expect(data.every((b: number) => b === 0)).toBe(true);
    }

    // Sender received rent from vault + stream closure
    const senderAfter = svm.getBalance(sender.publicKey);
    expect(senderAfter > senderBefore).toBe(true);
  });
});
