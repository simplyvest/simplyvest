import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

import {
  findMilestoneStreamPDA,
  findVaultPDA,
  findCreatorConfigPDA,
  parseEvents,
  findEvent,
} from "./helpers";
import { setupTest, createMint, createTokenAccount, mintTo } from "./utils";

describe("Feature 3: milestone streams", () => {
  let program: any;
  let svm: any;
  let svmAirdrop: (addresses: PublicKey[]) => void;
  let svmTokenBalance: (pk: PublicKey) => bigint;
  let provider: any;

  beforeEach(() => {
    ({ program, provider, svm, svmAirdrop, svmTokenBalance } = setupTest());
  });



  const createMilestoneStreamFixture = async (amount: number) => {
    const sender = Keypair.generate();
    const recipient = Keypair.generate();
    const milestoneAuthority = Keypair.generate();
    svmAirdrop([sender.publicKey, recipient.publicKey, milestoneAuthority.publicKey]);

    const mint = await createMint(provider, sender, sender.publicKey, 6);
    const senderToken = await createTokenAccount(provider, sender, mint, sender.publicKey);
    await mintTo(provider, mint, senderToken, sender, BigInt(amount));

    const [creatorConfigPDA] = await findCreatorConfigPDA(sender.publicKey);
    const [streamPDA] = await findMilestoneStreamPDA(
      sender.publicKey,
      recipient.publicKey,
      mint,
      new BN(0),
    );
    const [vaultPDA] = await findVaultPDA(streamPDA);

    await program.methods
      .createMilestoneStream({ amount: new BN(amount) })
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        milestoneAuthority: milestoneAuthority.publicKey,
        creatorConfig: creatorConfigPDA,
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

  // Shared accounts for trigger
  const triggerAccounts = (milestoneAuthority: PublicKey, stream: PublicKey) => ({
    milestoneAuthority,
    stream,
  });

  // Shared accounts for withdraw
  const withdrawMilestoneAccounts = (
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

  // Shared accounts for cancel
  const cancelMilestoneAccounts = (
    sender: PublicKey,
    stream: PublicKey,
    vault: PublicKey,
    senderToken: PublicKey,
    mint: PublicKey,
  ) => ({
    sender,
    stream,
    vault,
    senderToken,
    mint,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  });

  // Cancel milestone requires sender_token to be the ATA of sender
  const senderAta = (mint: PublicKey, sender: PublicKey) =>
    getAssociatedTokenAddressSync(mint, sender, true);

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
    } = await createMilestoneStreamFixture(100_000_000);

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
    const { amount } = await createMilestoneStreamFixture(100_000_000);

    // Re-create to capture the event
    const { provider: p2, program: prog2, svmAirdrop: a2 } = setupTest();
    const s2 = Keypair.generate();
    const r2 = Keypair.generate();
    const ma2 = Keypair.generate();
    a2([s2.publicKey, r2.publicKey, ma2.publicKey]);

    const mint2 = await createMint(p2, s2, s2.publicKey, 6);
    const st2 = await createTokenAccount(p2, s2, mint2, s2.publicKey);
    await mintTo(p2, mint2, st2, s2, BigInt(amount));

    const [cc2] = await findCreatorConfigPDA(s2.publicKey);
    const [sp2] = await findMilestoneStreamPDA(s2.publicKey, r2.publicKey, mint2, new BN(0));
    const [vp2] = await findVaultPDA(sp2);

    const txSig = await prog2.methods
      .createMilestoneStream({ amount: new BN(amount) })
      .accounts({
        sender: s2.publicKey,
        recipient: r2.publicKey,
        milestoneAuthority: ma2.publicKey,
        creatorConfig: cc2,
        stream: sp2,
        vault: vp2,
        senderToken: st2,
        mint: mint2,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([s2])
      .rpc();

    const events = await parseEvents(p2, prog2, txSig);
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
    const { milestoneAuthority, streamPDA } = await createMilestoneStreamFixture(100_000_000);

    await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const stream = await program.account.milestoneStreamAccount.fetch(streamPDA);
    expect(stream.milestoneReached).toBe(true);
  });

  it("emits MilestoneTriggered event", async () => {
    const { milestoneAuthority, streamPDA } = await createMilestoneStreamFixture(100_000_000);

    const txSig = await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const events = await parseEvents(provider, program, txSig);
    const event = findEvent(events, "milestoneTriggered");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.milestoneAuthority.toBase58()).toBe(milestoneAuthority.publicKey.toBase58());
  });

  it("rejects trigger by non-authority", async () => {
    const { streamPDA } = await createMilestoneStreamFixture(100_000_000);
    const imposter = Keypair.generate();
    svmAirdrop([imposter.publicKey]);

    await expect(
      program.methods
        .triggerMilestone()
        .accounts(triggerAccounts(imposter.publicKey, streamPDA))
        .signers([imposter])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects trigger if already cancelled", async () => {
    const { sender, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture(100_000_000);

    const senderAtaAddr = senderAta(mint, sender.publicKey);

    // Cancel first
    await program.methods
      .cancelMilestone()
      .accounts(cancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint))
      .signers([sender])
      .rpc();

    await expect(
      program.methods
        .triggerMilestone()
        .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
        .signers([milestoneAuthority])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects trigger if already reached", async () => {
    const { milestoneAuthority, streamPDA } = await createMilestoneStreamFixture(100_000_000);

    // First trigger succeeds
    await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    // Second trigger should fail
    await expect(
      program.methods
        .triggerMilestone()
        .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
        .signers([milestoneAuthority])
        .rpc(),
    ).rejects.toThrow();
  });

  // ── withdraw_milestone ───────────────────────────────────────────

  it("withdraw_milestone sends full amount to recipient", async () => {
    const { sender, recipient, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture(500_000_000);

    // Trigger milestone
    await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);
    const vaultBefore = svmTokenBalance(vaultPDA);
    const recipientBefore = svmTokenBalance(recipientToken);

    await program.methods
      .withdrawMilestone()
      .accounts(
        withdrawMilestoneAccounts(
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
      await createMilestoneStreamFixture(500_000_000);

    await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

    const txSig = await program.methods
      .withdrawMilestone()
      .accounts(
        withdrawMilestoneAccounts(
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
    const event = findEvent(events, "milestoneCompleted");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.recipient.toBase58()).toBe(recipient.publicKey.toBase58());
    expect(event.data.amount.toNumber()).toBe(amount);
  });

  it("rejects withdraw before milestone reached", async () => {
    const { sender, recipient, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture(100_000_000);

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

    await expect(
      program.methods
        .withdrawMilestone()
        .accounts(
          withdrawMilestoneAccounts(
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

  it("rejects withdraw after already withdrawn", async () => {
    const { sender, recipient, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture(500_000_000);

    await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const recipientToken = getAssociatedTokenAddressSync(mint, recipient.publicKey, true);

    // First withdraw succeeds
    await program.methods
      .withdrawMilestone()
      .accounts(
        withdrawMilestoneAccounts(
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
        .accounts(
          withdrawMilestoneAccounts(
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

  it("allows any signer to withdraw after milestone (no recipient constraint)", async () => {
    const { sender, milestoneAuthority, mint, streamPDA, vaultPDA, amount } =
      await createMilestoneStreamFixture(500_000_000);

    await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    const thirdParty = Keypair.generate();
    svmAirdrop([thirdParty.publicKey]);
    const thirdPartyToken = getAssociatedTokenAddressSync(mint, thirdParty.publicKey, true);

    // Program doesn't constrain who signs — any signer can trigger payout
    // (tokens go to the signer's ATA via init_if_needed)
    await program.methods
      .withdrawMilestone()
      .accounts(
        withdrawMilestoneAccounts(
          thirdParty.publicKey,
          streamPDA,
          vaultPDA,
          thirdPartyToken,
          sender.publicKey,
          mint,
        ),
      )
      .signers([thirdParty])
      .rpc();

    expect(svmTokenBalance(thirdPartyToken)).toBe(BigInt(amount));
  });

  // ── cancel_milestone ─────────────────────────────────────────────

  it("cancel_milestone before trigger returns all to creator", async () => {
    const { sender, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture(100_000_000);

    const senderAtaAddr = senderAta(mint, sender.publicKey);
    const vaultBefore = svmTokenBalance(vaultPDA);

    await program.methods
      .cancelMilestone()
      .accounts(cancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint))
      .signers([sender])
      .rpc();

    expect(svm.getAccount(vaultPDA)).toBeNull();

    // All tokens returned to creator (via ATA which init_if_needed creates)
    expect(svmTokenBalance(senderAtaAddr)).toBe(vaultBefore);
  });

  it("emits MilestoneCancelled event on cancel", async () => {
    const { sender, mint, streamPDA, vaultPDA, amount } =
      await createMilestoneStreamFixture(100_000_000);

    const senderAtaAddr = senderAta(mint, sender.publicKey);

    const txSig = await program.methods
      .cancelMilestone()
      .accounts(cancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint))
      .signers([sender])
      .rpc();

    const events = await parseEvents(provider, program, txSig);
    const event = findEvent(events, "milestoneCancelled");

    expect(event.data.stream.toBase58()).toBe(streamPDA.toBase58());
    expect(event.data.creator.toBase58()).toBe(sender.publicKey.toBase58());
    expect(event.data.returnedToCreator.toNumber()).toBe(amount);
  });

  it("rejects cancel_milestone by non-creator", async () => {
    const { sender, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(100_000_000);

    const senderAtaAddr = senderAta(mint, sender.publicKey);
    const imposter = Keypair.generate();
    svmAirdrop([imposter.publicKey]);

    await expect(
      program.methods
        .cancelMilestone()
        .accounts(
          cancelMilestoneAccounts(imposter.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint),
        )
        .signers([imposter])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects cancel_milestone if already cancelled", async () => {
    const { sender, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(100_000_000);

    const senderAtaAddr = senderAta(mint, sender.publicKey);

    // First cancel succeeds
    await program.methods
      .cancelMilestone()
      .accounts(cancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint))
      .signers([sender])
      .rpc();

    // Second cancel should fail
    await expect(
      program.methods
        .cancelMilestone()
        .accounts(
          cancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint),
        )
        .signers([sender])
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects cancel_milestone after milestone reached", async () => {
    const { sender, milestoneAuthority, mint, streamPDA, vaultPDA } =
      await createMilestoneStreamFixture(100_000_000);

    const senderAtaAddr = senderAta(mint, sender.publicKey);

    // Trigger milestone
    await program.methods
      .triggerMilestone()
      .accounts(triggerAccounts(milestoneAuthority.publicKey, streamPDA))
      .signers([milestoneAuthority])
      .rpc();

    // Cancel should fail — milestone already reached
    await expect(
      program.methods
        .cancelMilestone()
        .accounts(
          cancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint),
        )
        .signers([sender])
        .rpc(),
    ).rejects.toThrow();
  });

  it("closes vault and stream on cancel", async () => {
    const { sender, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(100_000_000);

    const senderAtaAddr = senderAta(mint, sender.publicKey);
    const senderBefore = svm.getBalance(sender.publicKey);

    await program.methods
      .cancelMilestone()
      .accounts(cancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderAtaAddr, mint))
      .signers([sender])
      .rpc();

    expect(svm.getAccount(vaultPDA)).toBeNull();

    const streamAcc = svm.getAccount(streamPDA);
    if (streamAcc) {
      const data = Buffer.from(streamAcc.data);
      expect(data.every((b: number) => b === 0)).toBe(true);
    }

    const senderAfter = svm.getBalance(sender.publicKey);
    expect(senderAfter > senderBefore).toBe(true);
  });
});
