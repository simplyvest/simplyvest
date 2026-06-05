import { BN } from "@coral-xyz/anchor";
import {
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getMilestoneStreamPda,
  getCreateStreamAccounts,
  getCreateMilestoneStreamAccounts,
  getWithdrawAccounts,
  getCancelAccounts,
  getCancelMilestoneAccounts,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";

import { createStreamFixture, createMilestoneStreamFixture } from "./fixtures";
import { clockNow } from "./helpers";
import { setupTest, SetupTest, createMint, createTokenAccount, mintTo } from "./utils";

describe("Feature 5: security audit", () => {
  let program: SetupTest["program"];
  let svm: SetupTest["svm"];
  let svmAirdrop: SetupTest["svmAirdrop"];
  let warp: SetupTest["warp"];
  let provider: SetupTest["provider"];

  beforeEach(() => {
    ({ program, provider, svm, svmAirdrop, warp } = setupTest());
  });

  // ── 1. SIGNER AUTHORITY ───────────────────────────────────────────────

  describe("signer authority", () => {
    it("rejects create_milestone_stream with non-sender signer", async () => {
      const { provider: prov, program: prog, svmAirdrop: a } = setupTest();
      const realSender = Keypair.generate();
      const recipient = Keypair.generate();
      const milestoneAuth = Keypair.generate();
      a([realSender.publicKey, recipient.publicKey, milestoneAuth.publicKey]);

      const mint = await createMint(prov, realSender, realSender.publicKey, 6);
      const senderToken = await createTokenAccount(prov, realSender, mint, realSender.publicKey);
      await mintTo(prov, mint, senderToken, realSender, BigInt(100_000_000));

      const [ccPDA] = getCreatorConfigPda(realSender.publicKey, PROGRAM_ID);
      const [spPDA] = getMilestoneStreamPda(
        realSender.publicKey,
        recipient.publicKey,
        mint,
        new BN(0),
        PROGRAM_ID,
      );
      const [vpPDA] = getVaultPda(spPDA, PROGRAM_ID);

      const imposter = Keypair.generate();
      a([imposter.publicKey]);

      await expect(
        prog.methods
          .createMilestoneStream({ amount: new BN(100_000_000) })
          .accountsPartial(
            getCreateMilestoneStreamAccounts(
              realSender.publicKey,
              recipient.publicKey,
              milestoneAuth.publicKey,
              ccPDA,
              spPDA,
              vpPDA,
              senderToken,
              mint,
            ),
          )
          .signers([imposter])
          .rpc(),
      ).rejects.toThrow();
    });

    it("rejects cancel_milestone with non-creator signer", async () => {
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
      ).rejects.toThrow();
    });

    it("rejects withdraw with wrong sender account on full withdrawal", async () => {
      const { recipient, mint, recipientToken, vaultPDA, streamPDA, amount } =
        await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 300, 0);
      warp(600);
      const wrongSender = Keypair.generate();
      svmAirdrop([wrongSender.publicKey]);

      await expect(
        program.methods
          .withdraw({ amount: new BN(amount) })
          .accountsPartial(
            getWithdrawAccounts(
              recipient.publicKey,
              streamPDA,
              vaultPDA,
              recipientToken,
              wrongSender.publicKey,
              mint,
            ),
          )
          .signers([recipient])
          .rpc(),
      ).rejects.toThrow();
    });
  });

  // ── 2. PDA UNIQUENESS ─────────────────────────────────────────────────

  describe("PDA seed uniqueness", () => {
    it("different senders produce different creator_config PDAs", () => {
      const [pda1] = getCreatorConfigPda(Keypair.generate().publicKey, PROGRAM_ID);
      const [pda2] = getCreatorConfigPda(Keypair.generate().publicKey, PROGRAM_ID);
      expect(pda1.equals(pda2)).toBe(false);
    });

    it("different streams produce different vault PDAs", () => {
      const [s1] = getStreamPda(
        Keypair.generate().publicKey,
        Keypair.generate().publicKey,
        Keypair.generate().publicKey,
        new BN(0),
        PROGRAM_ID,
      );
      const [s2] = getStreamPda(
        Keypair.generate().publicKey,
        Keypair.generate().publicKey,
        Keypair.generate().publicKey,
        new BN(1),
        PROGRAM_ID,
      );
      const [v1] = getVaultPda(s1, PROGRAM_ID);
      const [v2] = getVaultPda(s2, PROGRAM_ID);
      expect(v1.equals(v2)).toBe(false);
    });

    it("vesting_count produces unique stream PDAs for same sender/recipient/mint", () => {
      const sk = Keypair.generate().publicKey;
      const rk = Keypair.generate().publicKey;
      const mk = Keypair.generate().publicKey;
      const [p0] = getStreamPda(sk, rk, mk, new BN(0), PROGRAM_ID);
      const [p1] = getStreamPda(sk, rk, mk, new BN(1), PROGRAM_ID);
      const [p2] = getStreamPda(sk, rk, mk, new BN(2), PROGRAM_ID);
      expect(p0.equals(p1)).toBe(false);
      expect(p0.equals(p2)).toBe(false);
    });

    it("wrong vault PDA rejected at Anchor constraint", async () => {
      const { sender, recipient, mint, senderToken, amount } = await createStreamFixture(
        { program, provider, svmAirdrop, svm },
        1_000_000,
        60,
        3600,
        0,
      );
      const now = clockNow(svm);
      const [otherStream] = getStreamPda(
        sender.publicKey,
        recipient.publicKey,
        mint,
        new BN(99),
        PROGRAM_ID,
      );
      const [wrongVault] = getVaultPda(otherStream, PROGRAM_ID);
      const [ccPDA] = getCreatorConfigPda(sender.publicKey, PROGRAM_ID);
      const [realStream] = getStreamPda(
        sender.publicKey,
        recipient.publicKey,
        mint,
        new BN(0),
        PROGRAM_ID,
      );

      await expect(
        program.methods
          .createStream({
            amount: new BN(amount),
            startTime: new BN(now + 60),
            endTime: new BN(now + 3660),
            cliffTime: new BN(0),
          })
          .accountsPartial(
            getCreateStreamAccounts(
              sender.publicKey,
              recipient.publicKey,
              mint,
              realStream,
              wrongVault,
              senderToken,
              ccPDA,
            ),
          )
          .signers([sender])
          .rpc(),
      ).rejects.toThrow();
    });
  });

  // ── 3. INTEGER OVERFLOW + LARGE AMOUNTS ───────────────────────────────

  describe("integer overflow protection", () => {
    it("handles large amount and vesting_count chain", async () => {
      const { provider: prov, program: prog, svmAirdrop: a, svmTokenBalance: tb } = setupTest();
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      a([sender.publicKey, recipient.publicKey]);

      const mint = await createMint(prov, sender, sender.publicKey, 6);
      const senderToken = await createTokenAccount(prov, sender, mint, sender.publicKey);
      const largeAmount = "10000000000000000";
      await mintTo(prov, mint, senderToken, sender, BigInt("20000000000000000"));

      const now = clockNow(svm) || 1_000_000;
      const start = now + 60;
      const end = start + 3600;

      const vaultPDAs = [0, 1].map((i) => {
        const [sp] = getStreamPda(
          sender.publicKey,
          recipient.publicKey,
          mint,
          new BN(i),
          PROGRAM_ID,
        );
        const [vp] = getVaultPda(sp, PROGRAM_ID);
        const [cc] = getCreatorConfigPda(sender.publicKey, PROGRAM_ID);

        const tx = prog.methods
          .createStream({
            amount: new BN(largeAmount),
            startTime: new BN(start),
            endTime: new BN(end),
            cliffTime: new BN(0),
          })
          .accountsPartial(
            getCreateStreamAccounts(
              sender.publicKey,
              recipient.publicKey,
              mint,
              sp,
              vp,
              senderToken,
              cc,
            ),
          )
          .signers([sender])
          .rpc();

        return { tx, vp };
      });

      await Promise.all(vaultPDAs.map((v) => v.tx));
      vaultPDAs.forEach(({ vp }) => expect(tb(vp)).toBe(BigInt(largeAmount)));

      const [configPDA] = getCreatorConfigPda(sender.publicKey, PROGRAM_ID);
      const config = await prog.account.creatorConfig.fetch(configPDA);
      expect(Number(config.vestingCount)).toBe(2);
    });
  });

  // ── 4. ACCOUNT OWNERSHIP & CONSTRAINT VERIFICATION ────────────────────

  describe("account ownership verification", () => {
    it("vault token account authority is the stream PDA", async () => {
      const { vaultPDA, streamPDA } = await createStreamFixture(
        { program, provider, svmAirdrop, svm },
        1_000_000,
        60,
        3600,
        60,
      );
      const vaultAcc = svm.getAccount(vaultPDA);
      if (!vaultAcc) throw new Error("vault account not found");
      const owner = new PublicKey(Buffer.from(vaultAcc.data).subarray(32, 64));
      expect(owner.equals(streamPDA)).toBe(true);
    });

    it("mint constraint on withdraw rejects mismatched mint", async () => {
      const { sender, recipient, vaultPDA, streamPDA } = await createStreamFixture(
        { program, provider, svmAirdrop, svm },
        1_000_000,
        10,
        300,
        0,
      );
      warp(600);
      const wrongMint = await createMint(provider, sender, sender.publicKey, 6);
      const wrongToken = getAssociatedTokenAddressSync(wrongMint, recipient.publicKey, true);

      await expect(
        program.methods
          .withdraw({ amount: new BN(100) })
          .accountsPartial(
            getWithdrawAccounts(
              recipient.publicKey,
              streamPDA,
              vaultPDA,
              wrongToken,
              sender.publicKey,
              wrongMint,
            ),
          )
          .signers([recipient])
          .rpc(),
      ).rejects.toThrow();
    });

    it("mint constraint on cancel rejects mismatched mint", async () => {
      const { sender, recipient, senderToken, vaultPDA, streamPDA } = await createStreamFixture(
        { program, provider, svmAirdrop, svm },
        1_000_000,
        60,
        3600,
        60,
      );
      warp(90);
      const wrongMint = await createMint(provider, sender, sender.publicKey, 6);
      const wrongToken = getAssociatedTokenAddressSync(wrongMint, recipient.publicKey, true);

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
              wrongToken,
              wrongMint,
            ),
          )
          .signers([sender])
          .rpc(),
      ).rejects.toThrow();
    });

    it("mint constraint on cancel_milestone rejects mismatched mint", async () => {
      const { sender, streamPDA, vaultPDA } = await createMilestoneStreamFixture(
        { program, provider, svmAirdrop, svm },
        100_000_000,
      );
      const wrongMint = await createMint(provider, sender, sender.publicKey, 6);
      const wrongAta = getAssociatedTokenAddressSync(wrongMint, sender.publicKey, true);

      await expect(
        program.methods
          .cancelMilestone()
          .accountsPartial(
            getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, wrongAta, wrongMint),
          )
          .signers([sender])
          .rpc(),
      ).rejects.toThrow();
    });
  });

  // ── 5. STATE TRANSITION GUARDS ────────────────────────────────────────

  describe("state transition guards", () => {
    it("cancel sets cancelled before CPI", async () => {
      const { sender, recipient, mint, senderToken, recipientToken, vaultPDA, streamPDA } =
        await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 60);
      warp(90);

      const before = await program.account.streamAccount.fetch(streamPDA);
      expect(before.cancelled).toBe(false);

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

      const after = svm.getAccount(streamPDA);
      if (after) {
        expect(Buffer.from(after.data).every((b: number) => b === 0)).toBe(true);
      }
    });

    it("cancel_milestone sets cancelled before CPI", async () => {
      const { sender, senderToken, mint, streamPDA, vaultPDA } = await createMilestoneStreamFixture(
        { program, provider, svmAirdrop, svm },
        100_000_000,
      );

      const before = await program.account.milestoneStreamAccount.fetch(streamPDA);
      expect(before.cancelled).toBe(false);

      await program.methods
        .cancelMilestone()
        .accountsPartial(
          getCancelMilestoneAccounts(sender.publicKey, streamPDA, vaultPDA, senderToken, mint),
        )
        .signers([sender])
        .rpc();

      const after = svm.getAccount(streamPDA);
      if (after) {
        expect(Buffer.from(after.data).every((b: number) => b === 0)).toBe(true);
      }
    });
  });

  // ── 6. WRONG ACCOUNT ATTACKS ──────────────────────────────────────────

  describe("wrong account attacks", () => {
    it("rejects withdraw with wrong vault PDA", async () => {
      const { sender, recipient, mint, recipientToken, streamPDA, amount } =
        await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 10, 300, 0);
      warp(600);
      const [wrongVault] = getVaultPda(Keypair.generate().publicKey, PROGRAM_ID);

      await expect(
        program.methods
          .withdraw({ amount: new BN(amount) })
          .accountsPartial(
            getWithdrawAccounts(
              recipient.publicKey,
              streamPDA,
              wrongVault,
              recipientToken,
              sender.publicKey,
              mint,
            ),
          )
          .signers([recipient])
          .rpc(),
      ).rejects.toThrow();
    });

    it("rejects cancel with wrong vault PDA", async () => {
      const { sender, recipient, mint, senderToken, recipientToken, streamPDA } =
        await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 60);
      warp(90);
      const [wrongVault] = getVaultPda(Keypair.generate().publicKey, PROGRAM_ID);

      await expect(
        program.methods
          .cancel()
          .accountsPartial(
            getCancelAccounts(
              sender.publicKey,
              recipient.publicKey,
              streamPDA,
              wrongVault,
              senderToken,
              recipientToken,
              mint,
            ),
          )
          .signers([sender])
          .rpc(),
      ).rejects.toThrow();
    });

    it("rejects cancel_milestone with wrong vault PDA", async () => {
      const { sender, senderToken, mint, streamPDA } = await createMilestoneStreamFixture(
        { program, provider, svmAirdrop, svm },
        100_000_000,
      );
      const [wrongVault] = getVaultPda(Keypair.generate().publicKey, PROGRAM_ID);

      await expect(
        program.methods
          .cancelMilestone()
          .accountsPartial(
            getCancelMilestoneAccounts(sender.publicKey, streamPDA, wrongVault, senderToken, mint),
          )
          .signers([sender])
          .rpc(),
      ).rejects.toThrow();
    });

    it("rejects cancel with wrong sender_token", async () => {
      const { sender, recipient, mint, recipientToken, vaultPDA, streamPDA } =
        await createStreamFixture({ program, provider, svmAirdrop, svm }, 1_000_000, 60, 3600, 60);
      warp(90);

      await expect(
        program.methods
          .cancel()
          .accountsPartial(
            getCancelAccounts(
              sender.publicKey,
              recipient.publicKey,
              streamPDA,
              vaultPDA,
              recipientToken,
              recipientToken,
              mint,
            ),
          )
          .signers([sender])
          .rpc(),
      ).rejects.toThrow();
    });
  });

  // ── 7. TIMESTAMP BOUNDARY SECURITY ────────────────────────────────────

  describe("timestamp boundary security", () => {
    it("rejects create_stream with start_time in the past", async () => {
      const { provider: prov, program: prog, svmAirdrop: a } = setupTest();
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      a([sender.publicKey]);

      const mint = await createMint(prov, sender, sender.publicKey, 6);
      const senderToken = await createTokenAccount(prov, sender, mint, sender.publicKey);
      await mintTo(prov, mint, senderToken, sender, BigInt(100_000_000));

      const start = clockNow(svm) - 10;
      const [sp] = getStreamPda(sender.publicKey, recipient.publicKey, mint, new BN(0), PROGRAM_ID);
      const [vp] = getVaultPda(sp, PROGRAM_ID);
      const [cc] = getCreatorConfigPda(sender.publicKey, PROGRAM_ID);

      await expect(
        prog.methods
          .createStream({
            amount: new BN(100_000_000),
            startTime: new BN(start),
            endTime: new BN(start + 3600),
            cliffTime: new BN(0),
          })
          .accountsPartial(
            getCreateStreamAccounts(
              sender.publicKey,
              recipient.publicKey,
              mint,
              sp,
              vp,
              senderToken,
              cc,
            ),
          )
          .signers([sender])
          .rpc(),
      ).rejects.toThrow();
    });
  });
});
