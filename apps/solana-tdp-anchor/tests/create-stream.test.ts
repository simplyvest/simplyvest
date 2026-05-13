import * as anchor from "@coral-xyz/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { setupTest, createMint, createTokenAccount, mintTo } from "./utils";
import { findStreamPDA, findVaultPDA, now } from "./helpers";

describe("create_stream", () => {
  it("creates stream and transfers tokens to vault", async () => {
    const { provider, program, svmAirdrop, svmTokenBalance } = setupTest();
    const sender = Keypair.generate();
    const recipient = Keypair.generate();
    svmAirdrop([sender.publicKey]);

    const mint = await createMint(provider, sender, sender.publicKey, 6);
    const senderTokenAccount = await createTokenAccount(provider, sender, mint, sender.publicKey);

    const amount = 100_000_000;
    await mintTo(provider, mint, senderTokenAccount, sender, BigInt(amount));

    const start = now() + 60;
    const end = start + 3600;
    const cliff = 0;

    const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey);
    const [vaultPDA] = await findVaultPDA(streamPDA);

    const senderBalanceBefore = svmTokenBalance(senderTokenAccount);

    await program.methods
      .createStream({
        amount: new anchor.BN(amount),
        startTime: new anchor.BN(start),
        endTime: new anchor.BN(end),
        cliffTime: new anchor.BN(cliff),
      })
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken: senderTokenAccount,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(stream.sender.toString()).toBe(sender.publicKey.toString());
    expect(stream.recipient.toString()).toBe(recipient.publicKey.toString());
    expect(stream.mint.toString()).toBe(mint.toString());
    expect(stream.vault.toString()).toBe(vaultPDA.toString());
    expect(Number(stream.amount)).toBe(amount);
    expect(Number(stream.amountWithdrawn)).toBe(0);
    expect(Number(stream.startTime)).toBe(start);
    expect(Number(stream.endTime)).toBe(end);
    expect(Number(stream.cliffTime)).toBe(0);
    expect(stream.cancelled).toBe(false);

    const vaultBalance = svmTokenBalance(vaultPDA);
    expect(vaultBalance).toBe(BigInt(amount));

    const senderBalanceAfter = svmTokenBalance(senderTokenAccount);
    expect(senderBalanceAfter).toBe(senderBalanceBefore - BigInt(amount));
  });

  it("creates stream with cliff_time in [start, end]", async () => {
    const { provider, program, svmAirdrop, svmTokenBalance } = setupTest();
    const sender = Keypair.generate();
    const recipient = Keypair.generate();
    svmAirdrop([sender.publicKey]);

    const mint = await createMint(provider, sender, sender.publicKey, 6);
    const senderTokenAccount = await createTokenAccount(provider, sender, mint, sender.publicKey);

    const amount = 50_000_000;
    await mintTo(provider, mint, senderTokenAccount, sender, BigInt(amount));

    const start = now() + 120;
    const cliff = start + 1800;
    const end = cliff + 3600;

    const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey);
    const [vaultPDA] = await findVaultPDA(streamPDA);

    await program.methods
      .createStream({
        amount: new anchor.BN(amount),
        startTime: new anchor.BN(start),
        endTime: new anchor.BN(end),
        cliffTime: new anchor.BN(cliff),
      })
      .accounts({
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken: senderTokenAccount,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(stream.cliffTime)).toBe(cliff);
    expect(Number(stream.amount)).toBe(amount);
  });

  describe("edge cases — validation", () => {
    it("rejects start_time >= end_time", async () => {
      const { provider, program, svmAirdrop } = setupTest();
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      svmAirdrop([sender.publicKey]);

      const mint = await createMint(provider, sender, sender.publicKey, 6);
      const senderTokenAccount = await createTokenAccount(provider, sender, mint, sender.publicKey);
      await mintTo(provider, mint, senderTokenAccount, sender, BigInt(100_000_000));

      const start = now() + 60;
      const end = start - 10;
      const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey);
      const [vaultPDA] = await findVaultPDA(streamPDA);

      await expect(
        program.methods
          .createStream({
            amount: new anchor.BN(100_000_000),
            startTime: new anchor.BN(start),
            endTime: new anchor.BN(end),
            cliffTime: new anchor.BN(0),
          })
          .accounts({
            sender: sender.publicKey,
            recipient: recipient.publicKey,
            stream: streamPDA,
            vault: vaultPDA,
            senderToken: senderTokenAccount,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([sender])
          .rpc(),
      ).rejects.toThrow(/start_time must be before end_time/);
    });

    it("rejects cliff_time outside [start_time, end_time]", async () => {
      const { provider, program, svmAirdrop } = setupTest();
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      svmAirdrop([sender.publicKey]);

      const mint = await createMint(provider, sender, sender.publicKey, 6);
      const senderTokenAccount = await createTokenAccount(provider, sender, mint, sender.publicKey);
      await mintTo(provider, mint, senderTokenAccount, sender, BigInt(100_000_000));

      const start = now() + 60;
      const end = start + 3600;
      const cliff = end + 100;
      const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey);
      const [vaultPDA] = await findVaultPDA(streamPDA);

      await expect(
        program.methods
          .createStream({
            amount: new anchor.BN(100_000_000),
            startTime: new anchor.BN(start),
            endTime: new anchor.BN(end),
            cliffTime: new anchor.BN(cliff),
          })
          .accounts({
            sender: sender.publicKey,
            recipient: recipient.publicKey,
            stream: streamPDA,
            vault: vaultPDA,
            senderToken: senderTokenAccount,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([sender])
          .rpc(),
      ).rejects.toThrow(/cliff_time must be between start_time and end_time/);
    });

    it("rejects cliff_time before start_time", async () => {
      const { provider, program, svmAirdrop } = setupTest();
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      svmAirdrop([sender.publicKey]);

      const mint = await createMint(provider, sender, sender.publicKey, 6);
      const senderTokenAccount = await createTokenAccount(provider, sender, mint, sender.publicKey);
      await mintTo(provider, mint, senderTokenAccount, sender, BigInt(100_000_000));

      const start = now() + 60;
      const cliff = start - 60;
      const end = start + 3600;
      const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey);
      const [vaultPDA] = await findVaultPDA(streamPDA);

      await expect(
        program.methods
          .createStream({
            amount: new anchor.BN(100_000_000),
            startTime: new anchor.BN(start),
            endTime: new anchor.BN(end),
            cliffTime: new anchor.BN(cliff),
          })
          .accounts({
            sender: sender.publicKey,
            recipient: recipient.publicKey,
            stream: streamPDA,
            vault: vaultPDA,
            senderToken: senderTokenAccount,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([sender])
          .rpc(),
      ).rejects.toThrow(/cliff_time must be between start_time and end_time/);
    });

    it("rejects zero amount", async () => {
      const { provider, program, svmAirdrop } = setupTest();
      const sender = Keypair.generate();
      const recipient = Keypair.generate();
      svmAirdrop([sender.publicKey]);

      const mint = await createMint(provider, sender, sender.publicKey, 6);
      const senderTokenAccount = await createTokenAccount(provider, sender, mint, sender.publicKey);
      await mintTo(provider, mint, senderTokenAccount, sender, BigInt(100_000_000));

      const start = now() + 60;
      const end = start + 3600;
      const [streamPDA] = await findStreamPDA(sender.publicKey, recipient.publicKey);
      const [vaultPDA] = await findVaultPDA(streamPDA);

      await expect(
        program.methods
          .createStream({
            amount: new anchor.BN(0),
            startTime: new anchor.BN(start),
            endTime: new anchor.BN(end),
            cliffTime: new anchor.BN(0),
          })
          .accounts({
            sender: sender.publicKey,
            recipient: recipient.publicKey,
            stream: streamPDA,
            vault: vaultPDA,
            senderToken: senderTokenAccount,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([sender])
          .rpc(),
      ).rejects.toThrow(/Amount must be greater than zero/);
    });
  });
});
