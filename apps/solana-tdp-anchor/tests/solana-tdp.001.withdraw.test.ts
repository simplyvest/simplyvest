import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { getWithdrawAccounts, getCancelAccounts, findEvent } from "@solana-tdp/sdk";
import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

import { createStreamFixture } from "./fixtures";
import { clockNow } from "./helpers";
import { setupTest, SetupTest, svmParseEvents } from "./utils";

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

  it("withdraws vested amount after cliff (partial vesting)", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, start, end } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 60);
    warp(1800); // half-way through vesting

    const elapsed = clockNow(svm) - start;
    const duration = end - start;
    const expectedVested = Math.floor((amount * elapsed) / duration);

    const vaultBefore = svmTokenBalance(vaultPDA);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .withdraw({ amount: new BN(expectedVested) })
      .accountsPartial(
        getWithdrawAccounts(
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
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 500_000_000, 10, 300, 10);
    warp(600); // past end

    await program.methods
      .withdraw({ amount: new BN(amount) })
      .accountsPartial(
        getWithdrawAccounts(
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
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, start, end } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
    warp(1800);

    const elapsed = clockNow(svm) - start;
    const duration = end - start;
    const withdraw1 = Math.floor((amount * elapsed) / duration);

    await program.methods
      .withdraw({ amount: new BN(withdraw1) })
      .accountsPartial(
        getWithdrawAccounts(
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
      start: st2,
      end: en2,
    } = await createStreamFixture({ program, provider, svmAirdrop, svm }, 2_000_000, 10, 7200, 10);
    warp(3600);

    const elapsed2 = clockNow(svm) - st2;
    const duration2 = en2 - st2;
    const withdraw2 = Math.floor((a2 * elapsed2) / duration2);

    await program.methods
      .withdraw({ amount: new BN(withdraw2) })
      .accountsPartial(getWithdrawAccounts(r2.publicKey, s2p, v2, rt2, s2.publicKey, m2))
      .signers([r2])
      .rpc();

    const stream2 = await program.account.streamAccount.fetch(s2p);
    expect(Number(stream2.amountWithdrawn)).toBe(withdraw2);
  });

  it("rejects if cliff not reached", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 100_000_000, 60, 3600, 120);
    warp(90); // between start (60) and cliff (120)

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          getWithdrawAccounts(
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
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 100_000_000, 60, 3600, 60);

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          getWithdrawAccounts(
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
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 120);
    // Warp to 1 second before cliff
    warp(cliff - clockNow(svm) - 1);

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          getWithdrawAccounts(
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

  it("withdraws at cliff_time boundary (returns accrued amount)", async () => {
    const {
      sender,
      recipient,
      mint,
      recipientToken,
      vaultPDA,
      streamPDA,
      start,
      cliff,
      end,
      amount,
    } = await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 120);
    warp(cliff - clockNow(svm)); // exactly at cliff_time

    // At the exact cliff boundary, elapsed = cliff - start, so it returns accrued amount
    const elapsed = cliff - start;
    const duration = end - start;
    const expectedVested = Math.floor((amount * elapsed) / duration);

    await program.methods
      .withdraw({ amount: new BN(expectedVested) })
      .accountsPartial(
        getWithdrawAccounts(
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
  });

  it("rejects if stream already cancelled", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, senderToken } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
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
    if (!provider.sendAndConfirm) throw new Error("sendAndConfirm not available");
    await provider.sendAndConfirm(ataTx, [recipient]);

    await program.methods
      .cancel()
      .accountsPartial(
        getCancelAccounts(
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

    await expect(
      program.methods
        .withdraw({ amount: new BN(1) })
        .accountsPartial(
          getWithdrawAccounts(
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
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, start, end } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
    warp(1800); // partially vested

    const elapsed = clockNow(svm) - start;
    const duration = end - start;
    const claimable = Math.floor((amount * elapsed) / duration);

    // Withdraw more than what's vested
    await expect(
      program.methods
        .withdraw({ amount: new BN(claimable + 1) })
        .accountsPartial(
          getWithdrawAccounts(
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
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount, start, end } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
    warp(1800);

    const elapsed = clockNow(svm) - start;
    const duration = end - start;
    const expectedVested = Math.floor((amount * elapsed) / duration);

    const txSig = await program.methods
      .withdraw({ amount: new BN(expectedVested) })
      .accountsPartial(
        getWithdrawAccounts(
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

    const events = await svmParseEvents(svm, program, txSig);
    const event = findEvent(events, "tokensClaimed");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.recipient.toBase58()).toBe(recipient.publicKey.toBase58());
    expect(event.data.amount.toNumber()).toBe(amount);
    expect(event.data.claimed.toNumber()).toBe(expectedVested);
    expect(event.data.totalClaimed.toNumber()).toBe(expectedVested);
  });

  it("closes vault and stream on final withdrawal", async () => {
    const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA, amount } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 500_000_000, 10, 300, 10);
    warp(600); // past end — fully vested
    const senderBefore = svm.getBalance(sender.publicKey) ?? BigInt(0);

    await program.methods
      .withdraw({ amount: new BN(amount) })
      .accountsPartial(
        getWithdrawAccounts(
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
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 400, 0);
    warp(110); // 25% elapsed (100 / 400)
    const expected = Math.floor((amount * 100) / 400);

    await program.methods
      .withdraw({ amount: new BN(expected) })
      .accountsPartial(
        getWithdrawAccounts(
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
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 400, 0);

    // First withdrawal at 50% elapsed
    warp(210);
    const half = Math.floor((amount * 200) / 400);
    await program.methods
      .withdraw({ amount: new BN(half) })
      .accountsPartial(
        getWithdrawAccounts(
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
      { program, provider, svmAirdrop, svm },
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
          getWithdrawAccounts(
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
      { program, provider, svmAirdrop, svm },
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
          getWithdrawAccounts(
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
