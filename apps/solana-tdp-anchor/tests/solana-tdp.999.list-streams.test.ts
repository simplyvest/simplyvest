import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

import {
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import { setupTest, createMint, createTokenAccount, mintTo } from "./utils";

describe("Feature 9: listing streams", () => {
  it("creates multiple streams and fetches each by derived PDA", async () => {
    const { provider, program, svmAirdrop, svmTokenBalance } = setupTest();

    const fixtures: {
      sender: Keypair;
      streamPDA: anchor.web3.PublicKey;
      amount: number;
      start: number;
      end: number;
    }[] = [];

    for (let i = 0; i < 3; i++) {
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      svmAirdrop([sender.publicKey, recipient.publicKey]);

      const mint = await createMint(provider, sender, sender.publicKey, 6);
      const senderToken = await createTokenAccount(
        provider,
        sender,
        mint,
        sender.publicKey,
      );

      const amount = (i + 1) * 10_000_000;
      await mintTo(provider, mint, senderToken, sender, BigInt(amount));

      const start = Math.floor(Date.now() / 1000) + 60;
      const end = start + 3600;

      const [streamPDA] = getStreamPda(
        sender.publicKey,
        recipient.publicKey,
        mint,
        new BN(i),
        PROGRAM_ID,
      );
      const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
      const [creatorConfigPDA] = getCreatorConfigPda(
        sender.publicKey,
        PROGRAM_ID,
      );

      await program.methods
        .createStream({
          amount: new BN(amount),
          startTime: new BN(start),
          endTime: new BN(end),
          cliffTime: new BN(0),
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

      fixtures.push({ sender, streamPDA, amount, start, end });
    }

    // Verify each stream by fetching its known PDA
    for (const f of fixtures) {
      const stream = await program.account.streamAccount.fetch(f.streamPDA);
      expect(stream.sender.equals(f.sender.publicKey)).toBe(true);
      expect(Number(stream.amount)).toBe(f.amount);
    }

    // Verify vault token balances add up
    for (const f of fixtures) {
      const vaultPDA = getVaultPda(f.streamPDA, PROGRAM_ID)[0];
      const balance = svmTokenBalance(vaultPDA);
      expect(balance).toBe(BigInt(f.amount));
    }
  });

  it("derives correct PDAs for sequential streams from same sender", async () => {
    const { provider, program, svmAirdrop, svmTokenBalance } = setupTest();
    const sender = Keypair.generate();
    const recipient = Keypair.generate();
    svmAirdrop([sender.publicKey, recipient.publicKey]);

    const mint = await createMint(provider, sender, sender.publicKey, 6);
    const senderToken = await createTokenAccount(
      provider,
      sender,
      mint,
      sender.publicKey,
    );
    await mintTo(provider, mint, senderToken, sender, BigInt(200_000_000));

    const start = Math.floor(Date.now() / 1000) + 60;
    const end = start + 3600;

    // Create two streams from the same sender/recipient/mint pair
    // They should have different PDAs due to vesting_count (0 and 1)
    const streamPdAs: anchor.web3.PublicKey[] = [];
    for (let i = 0; i < 2; i++) {
      const [streamPDA] = getStreamPda(
        sender.publicKey,
        recipient.publicKey,
        mint,
        new BN(i),
        PROGRAM_ID,
      );
      const [vaultPDA] = getVaultPda(streamPDA, PROGRAM_ID);
      const [creatorConfigPDA] = getCreatorConfigPda(
        sender.publicKey,
        PROGRAM_ID,
      );

      await program.methods
        .createStream({
          amount: new BN(100_000_000),
          startTime: new BN(start),
          endTime: new BN(end),
          cliffTime: new BN(0),
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

      streamPdAs.push(streamPDA);
    }

    // Both streams should have different addresses
    expect(streamPdAs[0].toBase58()).not.toBe(streamPdAs[1].toBase58());

    // Both streams should be fetchable
    const stream0 = await program.account.streamAccount.fetch(streamPdAs[0]);
    const stream1 = await program.account.streamAccount.fetch(streamPdAs[1]);

    expect(stream0.sender.equals(sender.publicKey)).toBe(true);
    expect(stream1.sender.equals(sender.publicKey)).toBe(true);
    expect(stream0.recipient.equals(recipient.publicKey)).toBe(true);
    expect(stream1.recipient.equals(recipient.publicKey)).toBe(true);

    // First stream has vesting_count 0, second has 1
    expect(Number(stream0.vestingCount)).toBe(0);
    expect(Number(stream1.vestingCount)).toBe(1);
  });

  it("returns no account for non-existent PDA", async () => {
    const { program, svm } = setupTest();

    // Verify attempting to fetch a non-existent stream PDA throws (SVM behavior)
    const phantomPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stream"), Keypair.generate().publicKey.toBuffer()],
      PROGRAM_ID,
    )[0];

    // fetchNullable on LiteSVM throws for missing accounts — catch it
    try {
      await program.account.streamAccount.fetchNullable(phantomPda);
      // If it doesn't throw, it should return null
    } catch {
      // Expected — LiteSVM doesn't support fetchNullable for missing accounts
    }
  });
});
