import { getCancelAccounts, findEvent } from "@solana-tdp/sdk";

import { createStreamFixture } from "./fixtures";
import { clockNow } from "./helpers";
import { setupTest, SetupTest, svmParseEvents } from "./utils";

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

  it("cancel between start_time and cliff_time returns all to sender", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 120); // cliff = start + 120s
    warp(90); // after start (60), before cliff (120)

    const vaultBefore = svmTokenBalance(vaultPDA);
    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);

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

    expect(svm.getAccount(vaultPDA)).toBeNull();

    // Nothing vested before cliff — all tokens return to sender
    expect(svmTokenBalance(senderToken)).toBe(senderBefore + vaultBefore);
    expect(svmTokenBalance(recipientToken)).toBe(recipientBefore);
  });

  it("cancel before start_time returns all to sender", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 60);

    const vaultBefore = svmTokenBalance(vaultPDA);
    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);

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
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
    warp(1210); // ~1/3 of vesting elapsed (1200s out of 3600s)

    const senderBefore = svmTokenBalance(senderToken);
    const recipientBefore = svmTokenBalance(recipientToken);
    const vaultBefore = svmTokenBalance(vaultPDA);

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

    expect(svm.getAccount(vaultPDA)).toBeNull();

    const recipientGained = svmTokenBalance(recipientToken) - recipientBefore;
    const senderGained = svmTokenBalance(senderToken) - senderBefore;

    expect(recipientGained).toBeGreaterThan(BigInt(0));
    expect(senderGained).toBeGreaterThan(BigInt(0));
    expect(recipientGained + senderGained).toBe(vaultBefore);
  });

  it("rejects cancel after end_time — use withdraw instead", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 300, 10);
    warp(600); // well past end

    await expect(
      program.methods
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
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects cancel at exactly end_time", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA, end } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 300, 10);
    warp(end - clockNow(svm)); // exactly at end_time

    await expect(
      program.methods
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
        .rpc(),
    ).rejects.toThrow();
  });

  it("rejects if already cancelled", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
    warp(100);

    // First cancel
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

    // Second cancel should fail (stream is closed)
    const promise = program.methods
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

    await expect(promise).rejects.toThrow();
  });

  it("emits StreamCancelled event", async () => {
    const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
    warp(1210);

    const txSig = await program.methods
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

    const events = await svmParseEvents(svm, program, txSig);
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
      await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 3600, 10);
    warp(100);
    const senderBefore = svm.getBalance(sender.publicKey) ?? BigInt(0);

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
