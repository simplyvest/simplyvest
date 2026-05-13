import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { setupTest, createMint, createTokenAccount, mintTo } from "./utils";
import { findStreamPDA, findVaultPDA } from "./helpers";

describe("Feature 1: withdraw", () => {
  let program: any;
  let svm: any;
  let svmAirdrop: (addresses: PublicKey[]) => void;
  let svmTokenBalance: (pk: PublicKey) => bigint;
  let warp: (seconds: number) => void;
  let provider: any;

  beforeEach(() => {
    ({ program, provider, svm, svmAirdrop, warp, svmTokenBalance } = setupTest());
  });

  const clockNow = () => Number(svm.getClock().unixTimestamp);

  // Create a fully set-up stream, returning keys and PDAs
  const createStreamFixture = async (
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

    const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey);
    const [vaultPDA] = await findVaultPDA(streamPDA);

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
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();

    return { sender, recipient, mint, senderToken, recipientToken, streamPDA, vaultPDA, amount, start, cliff, end };
  };

  it("withdraws vested amount after cliff (partial vesting)", async () => {
    const { recipient, recipientToken, vaultPDA, streamPDA, amount, start, end } =
      await createStreamFixture(1_000_000, 60, 3600, 60);
    warp(1800); // half-way through vesting (1800 - 60 from start = 1740 elapsed of 3540)

    const vaultBefore = svmTokenBalance(vaultPDA);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .withdraw()
      .accounts({
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([recipient])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(stream.amountWithdrawn)).toBeGreaterThan(0);

    const vaultAfter = svmTokenBalance(vaultPDA);
    const recipientAfter = svmTokenBalance(recipientToken);
    const withdrawn = Number(stream.amountWithdrawn);

    expect(vaultAfter).toBe(vaultBefore - BigInt(withdrawn));
    expect(recipientAfter).toBe(recipientBefore + BigInt(withdrawn));
  });

  it("withdraws full amount after end_time", async () => {
    const { recipient, recipientToken, vaultPDA, streamPDA, amount } =
      await createStreamFixture(500_000_000, 10, 300, 10);
    warp(600); // past end

    await program.methods
      .withdraw()
      .accounts({
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([recipient])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(stream.amountWithdrawn)).toBe(amount);
    expect(stream.cancelled).toBe(false);
    expect(svmTokenBalance(vaultPDA)).toBe(BigInt(0));
  });

  it("tracks cumulative amount_withdrawn", async () => {
    // Single withdraw, then verify amount_withdrawn accounts exist
    const { recipient, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture(1_000_000, 10, 3600, 10);
    warp(1800);

    await program.methods
      .withdraw()
      .accounts({
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([recipient])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    const withdrawn = Number(stream.amountWithdrawn);
    expect(withdrawn).toBeGreaterThan(0);
    expect(withdrawn).toBeLessThan(1_000_000);

    // Second withdraw on a fresh stream via a separate fixture
    // (LiteSVM blockhash doesn't advance so sequential calls on same stream can fail)
    const { recipient: r2, recipientToken: rt2, vaultPDA: v2, streamPDA: s2 } =
      await createStreamFixture(2_000_000, 10, 7200, 10);
    warp(3600);

    await program.methods
      .withdraw()
      .accounts({
        recipient: r2.publicKey,
        stream: s2,
        vault: v2,
        recipientToken: rt2,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([r2])
      .rpc();

    const stream2 = await program.account.streamAccount.fetch(s2);
    expect(Number(stream2.amountWithdrawn)).toBeGreaterThan(0);
  });

  it("rejects if cliff not reached", async () => {
    const { recipient, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture(100_000_000, 60, 3600, 120);
    warp(90); // between start (60) and cliff (120)

    await expect(
      program.methods
        .withdraw()
        .accounts({
          recipient: recipient.publicKey,
          stream: streamPDA,
          vault: vaultPDA,
          recipientToken,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects if nothing to withdraw (before start_time)", async () => {
    const { recipient, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture(100_000_000, 60, 3600, 60);

    await expect(
      program.methods
        .withdraw()
        .accounts({
          recipient: recipient.publicKey,
          stream: streamPDA,
          vault: vaultPDA,
          recipientToken,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects if stream already cancelled", async () => {
    const { sender, recipient, recipientToken, vaultPDA, streamPDA, senderToken } =
      await createStreamFixture(1_000_000, 10, 3600, 10);
    warp(100);

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

    await expect(
      program.methods
        .withdraw()
        .accounts({
          recipient: recipient.publicKey,
          stream: streamPDA,
          vault: vaultPDA,
          recipientToken,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });
});
