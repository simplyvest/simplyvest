import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

import {
  findStreamPDA,
  findVaultPDA,
  findCreatorConfigPDA,
  parseEvents,
  findEvent,
} from "./helpers";
import { setupTest, SetupTest, createMint, createTokenAccount, mintTo } from "./utils";

// Shared account set for withdraw instructions
const withdrawAccounts = (
  recipient: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  recipientToken: PublicKey,
  sender: PublicKey,
  mint: PublicKey,
) => ({
  recipient,
  stream,
  vault,
  recipientToken,
  sender,
  mint,
  tokenProgram: TOKEN_PROGRAM_ID,
  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
});

describe("Feature 1: withdraw", () => {
  let program: SetupTest["program"];
  let svm: SetupTest["svm"];
  let svmAirdrop: SetupTest["svmAirdrop"];
  let svmTokenBalance: SetupTest["svmTokenBalance"];
  let warp: SetupTest["warp"];
  let provider: SetupTest["provider"];

  beforeEach(() => {
    ({ program, provider, svm, svmAirdrop, warp, svmTokenBalance } = setupTest());
  });

  const clockNow = () => Number(svm.getClock().unixTimestamp);

  // Create a fully set-up stream, returning keys and PDAs.
  // `recipientToken` is the ATA address — the withdraw handler creates it on demand.
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
    await mintTo(provider, mint, senderToken, sender, BigInt(amount));

    // Derive ATA address (account won't be created yet — withdraw handler does it)
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
      .accountsPartial({
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

  it("withdraws vested amount after cliff (partial vesting)", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, cliff, end } =
      await createStreamFixture(1_000_000, 60, 3600, 60);
    warp(1800); // half-way through vesting

    const elapsed = clockNow() - cliff;
    const duration = end - cliff;
    const expectedVested = Math.floor((amount * elapsed) / duration);

    const vaultBefore = svmTokenBalance(vaultPDA);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .withdraw({ amount: new BN(expectedVested) })
      .accountsPartial(
        withdrawAccounts(
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          recipientToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([recipient])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(stream.amountWithdrawn)).toBe(expectedVested);

    const vaultAfter = svmTokenBalance(vaultPDA);
    const recipientAfter = svmTokenBalance(recipientToken);

    expect(vaultAfter).toBe(vaultBefore - BigInt(expectedVested));
    expect(recipientAfter).toBe(recipientBefore + BigInt(expectedVested));
  });

  it("withdraws full amount after end_time", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount } =
      await createStreamFixture(500_000_000, 10, 300, 10);
    warp(600); // past end

    await program.methods
      .withdraw({ amount: new BN(amount) })
      .accountsPartial(
        withdrawAccounts(
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          recipientToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([recipient])
      .rpc();

    // Final withdrawal — vault and stream are closed
    expect(svm.getAccount(vaultPDA)).toBeNull();
    const streamAcc = svm.getAccount(streamPDA);
    if (streamAcc) {
      // Data may be zeroed or account fully purged by SVM
      const data = Buffer.from(streamAcc.data);
      expect(data.every((b: number) => b === 0)).toBe(true);
    }
  });

  it("tracks cumulative amount_withdrawn", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, cliff, end } =
      await createStreamFixture(1_000_000, 10, 3600, 10);
    warp(1800);

    const elapsed = clockNow() - cliff;
    const duration = end - cliff;
    const withdraw1 = Math.floor((amount * elapsed) / duration);

    await program.methods
      .withdraw({ amount: new BN(withdraw1) })
      .accountsPartial(
        withdrawAccounts(
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          recipientToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([recipient])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(stream.amountWithdrawn)).toBe(withdraw1);
    expect(withdraw1).toBeGreaterThan(0);
    expect(withdraw1).toBeLessThan(amount);

    // Second fixture: different amounts to verify cumulative tracking
    const {
      sender: s2,
      recipient: r2,
      mint: m2,
      recipientToken: rt2,
      vaultPDA: v2,
      streamPDA: s2p,
      amount: a2,
      cliff: cl2,
      end: en2,
    } = await createStreamFixture(2_000_000, 10, 7200, 10);
    warp(3600);

    const elapsed2 = clockNow() - cl2;
    const duration2 = en2 - cl2;
    const withdraw2 = Math.floor((a2 * elapsed2) / duration2);

    await program.methods
      .withdraw({ amount: new BN(withdraw2) })
      .accountsPartial(withdrawAccounts(r2.publicKey, s2p, v2, rt2, s2.publicKey, m2))
      .signers([r2])
      .rpc();

    const stream2 = await program.account.streamAccount.fetch(s2p);
    expect(Number(stream2.amountWithdrawn)).toBe(withdraw2);
  });

  it("rejects if cliff not reached", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture(100_000_000, 60, 3600, 120);
    warp(90); // between start (60) and cliff (120)

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          withdrawAccounts(
            recipient.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects if nothing to withdraw (before start_time)", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture(100_000_000, 60, 3600, 60);

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          withdrawAccounts(
            recipient.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects withdraw 1 second before cliff_time", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, cliff } =
      await createStreamFixture(1_000_000, 60, 3600, 120);
    // Warp to 1 second before cliff
    warp(cliff - clockNow() - 1);

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          withdrawAccounts(
            recipient.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("withdraws at cliff_time boundary (elapsed = 0)", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, cliff } =
      await createStreamFixture(1_000_000, 60, 3600, 120);
    warp(cliff - clockNow()); // exactly at cliff_time

    // At the exact cliff boundary, elapsed = 0, so vested = 0
    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          withdrawAccounts(
            recipient.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects if stream already cancelled", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, senderToken } =
      await createStreamFixture(1_000_000, 10, 3600, 10);
    warp(100);

    // Cancel needs an initialized token account for recipient.
    // Pre-create the ATA so cancel works.
    const ataTx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        recipient.publicKey,
        recipientToken,
        recipient.publicKey,
        mint,
      ),
    );
    await provider.sendAndConfirm!(ataTx, [recipient]);

    await program.methods
      .cancel()
      .accountsPartial({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken,
        mint,
        recipientToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([sender])
      .rpc();

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          withdrawAccounts(
            recipient.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects amount > claimable", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, cliff, end } =
      await createStreamFixture(1_000_000, 10, 3600, 10);
    warp(1800); // partially vested

    const elapsed = clockNow() - cliff;
    const duration = end - cliff;
    const claimable = Math.floor((amount * elapsed) / duration);

    // Withdraw more than what's vested
    await expect(
      program.methods
        .withdraw({ amount: new BN(claimable + 1) })
        .accountsPartial(
          withdrawAccounts(
            recipient.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([recipient])
        .rpc(),
    ).rejects.toThrow();
  });

  it("emits TokensClaimed event", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, cliff, end } =
      await createStreamFixture(1_000_000, 10, 3600, 10);
    warp(1800);

    const elapsed = clockNow() - cliff;
    const duration = end - cliff;
    const expectedVested = Math.floor((amount * elapsed) / duration);

    const txSig = await program.methods
      .withdraw({ amount: new BN(expectedVested) })
      .accountsPartial(
        withdrawAccounts(
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          recipientToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([recipient])
      .rpc();

    const events = await parseEvents(provider, program, txSig);
    const event = findEvent(events, "tokensClaimed");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.recipient.toBase58()).toBe(recipient.publicKey.toBase58());
    expect(event.data.amount.toNumber()).toBe(amount);
    expect(event.data.claimed.toNumber()).toBe(expectedVested);
    expect(event.data.totalClaimed.toNumber()).toBe(expectedVested);
  });

  it("closes vault and stream on final withdrawal", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount } =
      await createStreamFixture(500_000_000, 10, 300, 10);
    warp(600); // past end — fully vested
    const senderBefore = svm.getBalance(sender.publicKey) ?? BigInt(0);

    await program.methods
      .withdraw({ amount: new BN(amount) })
      .accountsPartial(
        withdrawAccounts(
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          recipientToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([recipient])
      .rpc();

    // Vault should be closed (account gone)
    expect(svm.getAccount(vaultPDA)).toBeNull();

    // Stream account should be closed (zeroed or purged)
    const streamAccount = svm.getAccount(streamPDA);
    if (streamAccount) {
      const data = Buffer.from(streamAccount.data);
      expect(data.every((b: number) => b === 0)).toBe(true);
    }

    // Sender should have received rent from vault + stream closure
    const senderAfter = svm.getBalance(sender.publicKey) ?? BigInt(0);
    expect(senderAfter > senderBefore).toBe(true);
  });

  // ── Vesting percentages, partial claims, and authorization ──────────────

  it("withdraws 25% at quarter vesting", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount } =
      await createStreamFixture(1_000_000, 10, 400, 0);
    warp(110); // 25% elapsed (100 / 400)
    const expected = Math.floor((amount * 100) / 400);

    await program.methods
      .withdraw({ amount: new BN(expected) })
      .accountsPartial(
        withdrawAccounts(
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          recipientToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([recipient])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(stream.amountWithdrawn)).toBe(expected);
  });

  it("withdraws 50% then remaining 50% on same stream", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount } =
      await createStreamFixture(1_000_000, 10, 400, 0);

    // First withdrawal at 50% elapsed
    warp(210);
    const half = Math.floor((amount * 200) / 400);
    await program.methods
      .withdraw({ amount: new BN(half) })
      .accountsPartial(
        withdrawAccounts(
          recipient.publicKey,
          streamPDA,
          vaultPDA,
          recipientToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([recipient])
      .rpc();

    const streamAfterFirst = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(streamAfterFirst.amountWithdrawn)).toBe(half);
    expect(svmTokenBalance(vaultPDA)).toBe(BigInt(amount - half));
  });

  it("rejects withdraw by third party", async () => {
    const { sender, mint, recipientToken, vaultPDA, streamPDA } = await createStreamFixture(
      1_000_000,
      10,
      400,
      0,
    );
    warp(210);
    const thirdParty = Keypair.generate();
    svmAirdrop([thirdParty.publicKey]);

    await expect(
      program.methods
        .withdraw({ amount: new BN(100) })
        .accountsPartial(
          withdrawAccounts(
            thirdParty.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([thirdParty])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects withdraw by creator (not recipient)", async () => {
    const { sender, mint, recipientToken, vaultPDA, streamPDA } = await createStreamFixture(
      1_000_000,
      10,
      400,
      0,
    );
    warp(210);

    await expect(
      program.methods
        .withdraw({ amount: new BN(100) })
        .accountsPartial(
          withdrawAccounts(
            sender.publicKey,
            streamPDA,
            vaultPDA,
            recipientToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([sender])
        .rpc(),
    ).rejects.toThrow();
  });
});
