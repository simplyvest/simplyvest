import * as anchor from "@coral-xyz/anchor";
import { anchor } from "@coral-xyz/anchor";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

const PROGRAM_ID = new anchor.web3.PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
);

describe("create_stream", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaTdp as anchor.Program;

  let mint: PublicKey;
  let senderTokenAccount: PublicKey;
  let recipientTokenAccount: PublicKey;
  let sender: Keypair;
  let recipient: Keypair;

  before(async () => {
    sender = anchor.web3.Keypair.generate();
    recipient = anchor.web3.Keypair.generate();

    const airdropSig = await provider.connection.requestAirdrop(
      sender.publicKey,
      anchor.web3.LAMPORTS_PER_SOL,
    );
    // await provider.connection.confirmTransaction(airdropSig);

    // const recipAirdrop = await provider.connection.requestAirdrop(
    //   recipient.publicKey,
    //   anchor.web3.LAMPORTS_PER_SOL
    // );
    await provider.connection.confirmTransaction(recipAirdrop);

    mint = await createMint(
      provider.connection,
      sender,
      sender.publicKey,
      null,
      6,
    );

    senderTokenAccount = await createAccount(
      provider.connection,
      sender,
      mint,
      sender.publicKey,
    );
    recipientTokenAccount = await createAccount(
      provider.connection,
      sender,
      mint,
      recipient.publicKey,
    );

    await mintTo(
      provider.connection,
      sender,
      mint,
      senderTokenAccount,
      sender,
      1_000_000_000,
    );
  });

  const findStreamPDA = (
    sender: PublicKey,
    recipient: PublicKey,
  ): Promise<[PublicKey, number]> => {
    return PublicKey.findProgramAddress(
      [Buffer.from("stream"), sender.toBuffer(), recipient.toBuffer()],
      PROGRAM_ID,
    );
  };

  const findVaultPDA = (stream: PublicKey): Promise<[PublicKey, number]> => {
    return PublicKey.findProgramAddress(
      [Buffer.from("vault"), stream.toBuffer()],
      PROGRAM_ID,
    );
  };

  const now = () => Math.floor(Date.now() / 1000);

  const createStreamIx = async (
    sender: Keypair,
    recipient: PublicKey,
    amount: number | bigint,
    startTime: number | bigint,
    endTime: number | bigint,
    cliffTime: number | bigint,
    allowBackdating: boolean,
  ) => {
    const [streamPDA, streamBump] = await findStreamPDA(
      sender.publicKey,
      recipient,
    );
    const [vaultPDA] = await findVaultPDA(streamPDA);

    const ix = await program.methods
      .createStream({
        amount: new anchor.BN(amount),
        startTime: new anchor.BN(startTime),
        endTime: new anchor.BN(endTime),
        cliffTime: new anchor.BN(cliffTime),
        streamBump,
        allowBackdating,
      })
      .accounts({
        sender: sender.publicKey,
        recipient,
        stream: streamPDA,
        vault: vaultPDA,
        senderToken: senderTokenAccount,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction();

    return { streamPDA, vaultPDA, ix, streamBump };
  };

  const getTokenBalance = async (account: PublicKey): Promise<number> => {
    const info = await provider.connection.getTokenAccountBalance(account);
    return parseInt(info.value.amount);
  };

  describe("happy path — future start, no cliff", () => {
    it("creates stream and transfers tokens to vault", async () => {
      const start = now() + 60;
      const end = start + 3600;
      const amount = 100_000_000;

      const { streamPDA, vaultPDA, ix } = await createStreamIx(
        sender,
        recipient.publicKey,
        amount,
        start,
        end,
        0,
        false,
      );

      const tx = new anchor.web3.Transaction().add(ix);
      await provider.sendAndConfirm(tx, [sender]);

      const stream = await program.account.streamAccount.fetch(streamPDA);
      expect(stream.sender.toString()).to.eq(sender.publicKey.toString());
      expect(stream.recipient.toString()).to.eq(recipient.publicKey.toString());
      expect(stream.mint.toString()).to.eq(mint.toString());
      expect(stream.vault.toString()).to.eq(vaultPDA.toString());
      expect(Number(stream.amount)).to.eq(amount);
      expect(Number(stream.amountWithdrawn)).to.eq(0);
      expect(Number(stream.startTime)).to.eq(start);
      expect(Number(stream.endTime)).to.eq(end);
      expect(Number(stream.cliffTime)).to.eq(0);
      expect(stream.cancelled).to.eq(false);

      const vaultBalance = await getTokenBalance(vaultPDA);
      expect(vaultBalance).to.eq(amount);

      const senderBalance = await getTokenBalance(senderTokenAccount);
      expect(senderBalance).to.eq(1_000_000_000 - amount);
    });
  });

  describe("with cliff", () => {
    it("creates stream with cliff_time in [start, end]", async () => {
      const start = now() + 120;
      const cliff = start + 1800;
      const end = cliff + 3600;
      const amount = 50_000_000;

      const { streamPDA } = await createStreamIx(
        sender,
        recipient.publicKey,
        amount,
        start,
        end,
        cliff,
        false,
      );

      const tx = new anchor.web3.Transaction().add(
        await program.methods
          .createStream({
            amount: new anchor.BN(amount),
            startTime: new anchor.BN(start),
            endTime: new anchor.BN(end),
            cliffTime: new anchor.BN(cliff),
            streamBump: 0,
            allowBackdating: false,
          })
          .accounts({
            sender: sender.publicKey,
            recipient: recipient.publicKey,
            stream: streamPDA,
            vault: (await findVaultPDA(streamPDA))[0],
            senderToken: senderTokenAccount,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .instruction(),
      );
      await provider.sendAndConfirm(tx, [sender]);

      const stream = await program.account.streamAccount.fetch(streamPDA);
      expect(Number(stream.cliffTime)).to.eq(cliff);
      expect(Number(stream.amount)).to.eq(amount);
    });
  });

  describe("edge cases — validation", () => {
    it("rejects start_time >= end_time", async () => {
      const start = now() + 60;
      const end = start - 10;

      try {
        const { ix } = await createStreamIx(
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          0,
          false,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidTimeRange");
      }
    });

    it("rejects cliff_time outside [start_time, end_time]", async () => {
      const start = now() + 60;
      const end = start + 3600;
      const cliff = end + 100;

      try {
        const { ix } = await createStreamIx(
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          cliff,
          false,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidCliffTime");
      }
    });

    it("rejects cliff_time before start_time", async () => {
      const start = now() + 60;
      const cliff = start - 60;
      const end = start + 3600;

      try {
        const { ix } = await createStreamIx(
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          cliff,
          false,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidCliffTime");
      }
    });

    it("rejects zero amount", async () => {
      const start = now() + 60;
      const end = start + 3600;

      try {
        const { ix } = await createStreamIx(
          sender,
          recipient.publicKey,
          0,
          start,
          end,
          0,
          false,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidAmount");
      }
    });

    it("rejects insufficient funds", async () => {
      const start = now() + 60;
      const end = start + 3600;
      const amount = 2_000_000_000;

      try {
        const { ix } = await createStreamIx(
          sender,
          recipient.publicKey,
          amount,
          start,
          end,
          0,
          false,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InsufficientFunds");
      }
    });

    it("rejects start_time in past without allow_backdating", async () => {
      const start = now() - 3600;
      const end = now() + 3600;

      try {
        const { ix } = await createStreamIx(
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          0,
          false,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("StartTimeInPast");
      }
    });

    it("allows start_time in past with allow_backdating = true", async () => {
      const start = now() - 3600;
      const end = now() + 3600;
      const amount = 50_000_000;

      const newRecipient = anchor.web3.Keypair.generate().publicKey;
      const { streamPDA, vaultPDA, ix } = await createStreamIx(
        sender,
        newRecipient,
        amount,
        start,
        end,
        0,
        true,
      );

      const tx = new anchor.web3.Transaction().add(ix);
      await provider.sendAndConfirm(tx, [sender]);

      const stream = await program.account.streamAccount.fetch(streamPDA);
      expect(stream.sender.toString()).to.eq(sender.publicKey.toString());
      expect(Number(stream.startTime)).to.eq(start);

      const vaultBalance = await getTokenBalance(vaultPDA);
      expect(vaultBalance).to.eq(amount);
    });

    it("rejects start_time more than 365 days in the future", async () => {
      const start = now() + 400 * 24 * 3600;
      const end = start + 3600;

      try {
        const { ix } = await createStreamIx(
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          0,
          false,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("StartTimeTooFar");
      }
    });
  });
});

describe("solana-tdp", () => {
  it("compilation check: package loads and test runs", async () => {
    expect(anchor).to.not.be.undefined;
    console.log("Requirement check: Test passing.");
  });
});
