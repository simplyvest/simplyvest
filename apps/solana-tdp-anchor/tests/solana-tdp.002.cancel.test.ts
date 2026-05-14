import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { setupTest, createMint, createTokenAccount, mintTo } from "./utils";
import { findStreamPDA, findVaultPDA, findCreatorConfigPDA } from "./helpers";

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
    const recipientToken = await createTokenAccount(provider, sender, mint, recipient.publicKey);

    await mintTo(provider, mint, senderToken, sender, BigInt(amount));

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

    return { sender, recipient, mint, senderToken, recipientToken, streamPDA, vaultPDA, amount, start, cliff, end };
  };

  it("cancel before start_time returns all to sender", async () => {
    const { sender, recipient, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 60, 3600, 60);

    const vaultBefore = svmTokenBalance(vaultPDA);
    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .cancel()
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([sender])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(stream.cancelled).toBe(true);

    expect(svmTokenBalance(vaultPDA)).toBe(BigInt(0));
    expect(svmTokenBalance(senderToken)).toBe(senderBefore + vaultBefore);
    expect(svmTokenBalance(recipientToken)).toBe(recipientBefore);
  });

  it("cancel after partial vesting splits accordingly", async () => {
    const { sender, recipient, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 3600, 10);
    warp(1210); // ~1/3 of vesting elapsed (1200s out of 3600s)

    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);
    const vaultBefore = svmTokenBalance(vaultPDA);

    await program.methods
      .cancel()
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([sender])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(stream.cancelled).toBe(true);

    expect(svmTokenBalance(vaultPDA)).toBe(BigInt(0));

    const recipientGained = svmTokenBalance(recipientToken) - recipientBefore;
    const senderGained = svmTokenBalance(senderToken) - senderBefore;

    expect(recipientGained).toBeGreaterThan(BigInt(0));
    expect(senderGained).toBeGreaterThan(BigInt(0));
    expect(recipientGained + senderGained).toBe(vaultBefore);
  });

  it("cancel after end_time gives all to recipient", async () => {
    const { sender, recipient, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 300, 10);
    warp(600); // well past end

    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);
    const vaultBefore = svmTokenBalance(vaultPDA);

    await program.methods
      .cancel()
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([sender])
      .rpc();

    expect(svmTokenBalance(vaultPDA)).toBe(BigInt(0));
    expect(svmTokenBalance(senderToken)).toBe(senderBefore); // nothing returned to sender
    expect(svmTokenBalance(recipientToken)).toBe(recipientBefore + vaultBefore);
  });

  it("rejects if already cancelled", async () => {
    const { sender, recipient, senderToken, recipientToken, vaultPDA, streamPDA } =
      await setupStream(1_000_000, 10, 3600, 10);
    warp(100);

    // First cancel
    await program.methods
      .cancel()
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([sender])
      .rpc();

    // Second cancel should fail
    const promise = program.methods
      .cancel()
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([sender])
      .rpc();

    await expect(promise).rejects.toThrow();
  });
});
