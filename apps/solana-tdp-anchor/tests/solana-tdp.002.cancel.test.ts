import { BN } from "@coral-xyz/anchor";
import {
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
  getCancelAccounts,
  parseEvents,
  findEvent,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";

import { setupTest, SetupTest, createMint, createTokenAccount, mintTo } from "./utils";

// Shared accounts for cancel instructions — uses SDK
const cancelAccounts = (
  sender: PublicKey,
  recipient: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  senderToken: PublicKey,
  recipientToken: PublicKey,
  mint: PublicKey,
) => getCancelAccounts(sender, recipient, stream, vault, senderToken, recipientToken, mint);

describe("Feature 2: cancel", () => {
  let program: SetupTest["program"];
  let svm: SetupTest["svm"];
  let svmAirdrop: SetupTest["svmAirdrop"];
  let svmTokenBalance: SetupTest["svmTokenBalance"];
  let warp: SetupTest["warp"];
  let provider: SetupTest["provider"];

  beforeEach(() => {
    ({ program, provider, svm, svmAirdrop, warp, svmTokenBalance } = setupTest());
  });

  // Use SVM clock for time calculations (LiteSVM starts at epoch 0)
  const clockNow = () => Number(svm.getClock().unixTimestamp);

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

  it("cancel between start_time and cliff_time returns all to sender", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 60, 3600, 120); // cliff = start + 120s
    warp(90); // after start (60), before cliff (120)

    const vaultBefore = svmTokenBalance(vaultPDA);
    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .cancel()
      .accountsPartial(
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
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 60, 3600, 60);

    const vaultBefore = svmTokenBalance(vaultPDA);
    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .cancel()
      .accountsPartial(
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
      .accountsPartial(
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
        .accountsPartial(
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
      .accountsPartial(
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
      .accountsPartial(
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
      .accountsPartial(
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
    const senderBefore = svm.getBalance(sender.publicKey) ?? BigInt(0);

    await program.methods
      .cancel()
      .accountsPartial(
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
    const senderAfter = svm.getBalance(sender.publicKey) ?? BigInt(0);
    expect(senderAfter > senderBefore).toBe(true);
  });
});
