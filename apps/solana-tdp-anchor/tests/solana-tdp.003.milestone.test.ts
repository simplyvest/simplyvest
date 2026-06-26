import { BN } from "@coral-xyz/anchor";
import {
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateMilestoneStreamAccounts,
  getTriggerMilestoneAccounts,
  getWithdrawMilestoneAccounts,
  getCancelMilestoneAccounts,
  findEvent,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

import { createMilestoneStreamFixture } from "./fixtures";
import {
  setupTest,
  SetupTest,
  svmParseEvents,
  createMint,
  createTokenAccount,
  mintTo,
} from "./utils";

describe("Feature 3: milestone streams", () => {
  let program: SetupTest["program"];
  let svm: SetupTest["svm"];
  let svmAirdrop: SetupTest["svmAirdrop"];
  let svmTokenBalance: SetupTest["svmTokenBalance"];
  let provider: SetupTest["provider"];

  beforeEach(() => {
    ({ program, provider, svm, svmAirdrop, svmTokenBalance } = setupTest());
  });

  // ── create_milestone_stream ─────────────────────────────────────

  it("creates milestone stream and transfers tokens to vault", async () => {
    const {
      sender,
      recipient,
      milestoneAuthority,
      mint,
      senderToken,
      streamPDA,
      vaultPDA,
      amount,
    } = await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 100_000_000);

    const stream = await program.account.milestoneStreamAccount.fetch(streamPDA);
    expect(stream.creator.toString()).toBe(sender.publicKey.toString());
    expect(stream.recipient.toString()).toBe(recipient.publicKey.toString());
    expect(stream.mint.toString()).toBe(mint.toString());
    expect(stream.vault.toString()).toBe(vaultPDA.toString());
    expect(Number(stream.amount)).toBe(amount);
    expect(Number(stream.amountWithdrawn)).toBe(0);
    expect(stream.milestoneAuthority.toString()).toBe(milestoneAuthority.publicKey.toString());
    expect(stream.milestoneReached).toBe(false);
    expect(stream.cancelled).toBe(false);

    expect(svmTokenBalance(vaultPDA)).toBe(BigInt(amount));
    expect(svmTokenBalance(senderToken)).toBe(BigInt(0));
  });

  it("emits MilestoneStreamCreated event", async () => {
    const { amount } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    // Re-create to capture the event
    const { provider: p2, program: prog2, svmAirdrop: a2, svm: svm2 } = setupTest();
    const s2 = Keypair.generate();
    const r2 = Keypair.generate();
    const ma2 = Keypair.generate();
    a2([s2.publicKey, r2.publicKey, ma2.publicKey]);

    const mint2 = await createMint(p2, s2, s2.publicKey, 6);
    const st2 = await createTokenAccount(p2, s2, mint2, s2.publicKey);
    await mintTo(p2, mint2, st2, s2, BigInt(amount));

    const [cc2] = getCreatorConfigPda(s2.publicKey, PROGRAM_ID);
    const [sp2] = getMilestoneStreamPda(s2.publicKey, r2.publicKey, mint2, new BN(0), PROGRAM_ID);
    const [vp2] = getVaultPda(sp2, PROGRAM_ID);

    const txSig = await prog2.methods
      .createMilestoneStream({ amount: new BN(amount) })
      .accountsPartial(
        getCreateMilestoneStreamAccounts(
          s2.publicKey,
          r2.publicKey,
          ma2.publicKey,
          cc2,
          sp2,
          vp2,
          st2,
          mint2,
        ),
      )
      .signers([s2])
      .rpc();

    const events = await svmParseEvents(svm2, prog2, txSig);
    const event = findEvent(events, "milestoneStreamCreated");

    expect(event.data.stream.toBase58()).toBe(sp2.toBase58());
    expect(event.data.creator.toBase58()).toBe(s2.publicKey.toBase58());
    expect(event.data.recipient.toBase58()).toBe(r2.publicKey.toBase58());
    expect(event.data.mint.toBase58()).toBe(mint2.toBase58());
    expect(event.data.amount.toNumber()).toBe(amount);
    expect(event.data.milestoneAuthority.toBase58()).toBe(ma2.publicKey.toBase58());
  });

  // ── trigger_milestone ────────────────────────────────────────────

  it("trigger_milestone sets milestone_reached = true", async () => {
    const { milestoneAuthority, streamPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const stream = await program.account.milestoneStreamAccount.fetch(streamPDA);
    expect(stream.milestoneReached).toBe(true);
  });

  it("emits MilestoneTriggered event", async () => {
    const { milestoneAuthority, streamPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    const txSig = await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const events = await svmParseEvents(svm, program, txSig);
    const event = findEvent(events, "milestoneTriggered");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.milestoneAuthority.toBase58()).toBe(milestoneAuthority.publicKey.toBase58());
  });

  it("rejects trigger by non-authority", async () => {
    const { streamPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );
    const imposter = Keypair.generate();
    svmAirdrop([imposter.publicKey]);

    await expect(
      program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(imposter.publicKey, streamPDA))
        .signers([imposter])
        .rpc(),
    ).rejects.toThrow("expected transaction to fail");
  });

  it("rejects trigger if already cancelled", async () => {
    const { sender, senderToken, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 100_000_000);

    // Cancel first
    await program.methods
      .cancelMilestone()
      .accountsPartial(
        getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
      )
      .signers([sender])
      .rpc();

    await expect(
      program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
        .signers([milestoneAuthority])
        .rpc(),
    ).rejects.toThrow("expected transaction to fail");
  });

  it("rejects trigger if already reached", async () => {
    const { milestoneAuthority, streamPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    // First trigger succeeds
    await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    // Second trigger should fail
    await expect(
      program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
        .signers([milestoneAuthority])
        .rpc(),
    ).rejects.toThrow("expected transaction to fail");
  });

  // ── withdraw_milestone ───────────────────────────────────────────

  it("withdraw_milestone sends full amount to recipient", async () => {
    const { sender, recipient, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 500_000_000);

    // Trigger milestone
    await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);
    const vaultBefore = svmTokenBalance(vaultPDA);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .withdrawMilestone()
      .accountsPartial(
        getWithdrawMilestoneAccounts(
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

    // Vault closed
    expect(svm.getAccount(vaultPDA)).toBeNull();

    // Recipient received full amount
    expect(svmTokenBalance(recipientToken)).toBe(recipientBefore + vaultBefore);
  });

  it("emits MilestoneCompleted event on withdraw", async () => {
    const { sender, recipient, milestoneAuthority, mint, streamPDA, vaultPDA, amount } =
      await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 500_000_000);

    await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

    const txSig = await program.methods
      .withdrawMilestone()
      .accountsPartial(
        getWithdrawMilestoneAccounts(
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
    const event = findEvent(events, "milestoneCompleted");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.recipient.toBase58()).toBe(recipient.publicKey.toBase58());
    expect(event.data.amount.toNumber()).toBe(amount);
  });

  it("rejects withdraw before milestone reached", async () => {
    const { sender, recipient, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

    await expect(
      program.methods
        .withdrawMilestone()
        .accountsPartial(
          getWithdrawMilestoneAccounts(
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
    ).rejects.toThrow("expected transaction to fail");
  });

  it("rejects withdraw after already withdrawn", async () => {
    const { sender, recipient, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 500_000_000);

    await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

    // First withdraw succeeds
    await program.methods
      .withdrawMilestone()
      .accountsPartial(
        getWithdrawMilestoneAccounts(
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

    // Second withdraw should fail (stream closed or fully withdrawn)
    await expect(
      program.methods
        .withdrawMilestone()
        .accountsPartial(
          getWithdrawMilestoneAccounts(
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
    ).rejects.toThrow("expected transaction to fail");
  });

  it("rejects unauthorized withdraw after milestone by non-recipient", async () => {
    const { sender, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 500_000_000);

    await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const thirdParty = Keypair.generate();
    svmAirdrop([thirdParty.publicKey]);
    const thirdPartyToken = getAssociatedTokenAddressSync(mint, thirdParty.publicKey, true);

    // Withdrawing with a third-party signer should fail due to the recipient constraint
    await expect(
      program.methods
        .withdrawMilestone()
        .accountsPartial(
          getWithdrawMilestoneAccounts(
            thirdParty.publicKey,
            streamPDA,
            vaultPDA,
            thirdPartyToken,
            sender.publicKey,
            mint,
          ),
        )
        .signers([thirdParty])
        .rpc(),
    ).rejects.toThrow("expected transaction to fail");
  });

  // ── cancel_milestone ─────────────────────────────────────────────

  it("cancel_milestone before trigger returns all to creator", async () => {
    const { sender, senderToken, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    const vaultBefore = svmTokenBalance(vaultPDA);

    await program.methods
      .cancelMilestone()
      .accountsPartial(
        getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
      )
      .signers([sender])
      .rpc();

    expect(svm.getAccount(vaultPDA)).toBeNull();

    // All tokens returned to creator (via ATA which init_if_needed creates)
    expect(svmTokenBalance(senderToken)).toBe(vaultBefore);
  });

  it("emits MilestoneCancelled event on cancel", async () => {
    const { sender, senderToken, mint, streamPDA, vaultPDA, amount } =
      await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 100_000_000);

    const txSig = await program.methods
      .cancelMilestone()
      .accountsPartial(
        getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
      )
      .signers([sender])
      .rpc();

    const events = await svmParseEvents(svm, program, txSig);
    const event = findEvent(events, "milestoneCancelled");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.creator.toBase58()).toBe(sender.publicKey.toBase58());
    expect(event.data.returnedToCreator.toNumber()).toBe(amount);
  });

  it("rejects cancel_milestone by non-creator", async () => {
    const { senderToken, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    const imposter = Keypair.generate();
    svmAirdrop([imposter.publicKey]);

    await expect(
      program.methods
        .cancelMilestone()
        .accountsPartial(
          getCancelMilestoneAccounts(imposter.publicKey, streamPDA, vaultPDA, senderToken, mint),
        )
        .signers([imposter])
        .rpc(),
    ).rejects.toThrow("expected transaction to fail");
  });

  it("rejects cancel_milestone if already cancelled", async () => {
    const { sender, senderToken, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    // First cancel succeeds
    await program.methods
      .cancelMilestone()
      .accountsPartial(
        getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
      )
      .signers([sender])
      .rpc();

    // Second cancel should fail
    await expect(
      program.methods
        .cancelMilestone()
        .accountsPartial(
          getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
        )
        .signers([sender])
        .rpc(),
    ).rejects.toThrow("expected transaction to fail");
  });

  it("rejects cancel_milestone after milestone reached", async () => {
    const { sender, senderToken, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture({ program, provider, svmAirdrop, svm }, 100_000_000);

    // Trigger milestone
    await program.methods
      .triggerMilestone()
      .accountsPartial(getTriggerMilestoneAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    // Cancel should fail — milestone already reached
    await expect(
      program.methods
        .cancelMilestone()
        .accountsPartial(
          getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
        )
        .signers([sender])
        .rpc(),
    ).rejects.toThrow("expected transaction to fail");
  });

  it("closes vault and stream on cancel", async () => {
    const { sender, senderToken, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(
      { program, provider, svmAirdrop, svm },
      100_000_000,
    );

    const senderBefore = svm.getBalance(sender.publicKey) ?? BigInt(0);

    await program.methods
      .cancelMilestone()
      .accountsPartial(
        getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
      )
      .signers([sender])
      .rpc();

    expect(svm.getAccount(vaultPDA)).toBeNull();

    const streamAcc = svm.getAccount(streamPDA);
    if (!streamAcc) {
      return; // Account was closed — already zeroed
    }
    const data = Buffer.from(streamAcc.data);
    expect(data.every((b: number) => b === 0)).toBe(true);

    const senderAfter = svm.getBalance(sender.publicKey) ?? BigInt(0);
    expect(senderAfter > senderBefore).toBe(true);
  });
});
