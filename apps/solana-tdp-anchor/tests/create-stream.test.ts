import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { getTestContext } from "./context";
import {
  findVaultPDA,
  now,
  createStreamIx,
  getTokenBalance,
} from "./helpers";

describe("create_stream", () => {
  it.skip("creates stream and transfers tokens to vault", async () => {
    const { provider, program, mint, senderTokenAccount, sender, recipient } =
      await getTestContext();

    const start = now() + 60;
    const end = start + 3600;
    const amount = 100_000_000;

    const { streamPDA, vaultPDA, ix } = await createStreamIx(
      program,
      sender,
      recipient.publicKey,
      amount,
      start,
      end,
      0,
      senderTokenAccount,
      mint,
    );

    const tx = new anchor.web3.Transaction().add(ix);
    await provider.sendAndConfirm(tx, [sender]);

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(stream.sender.toString()).to.eq(sender.publicKey.toString());
    expect(stream.recipient.toString()).to.eq(recipient.publicKey.toString());
    expect(stream.mint.toString()).to.eq(mint.toString());
    expect(stream.vault.toString()).to.eq(vaultPDA.toString());
    expect(Number(stream.amount)).to.eq(amount);
    expect(Number(stream.amount_withdrawn)).to.eq(0);
    expect(Number(stream.start_time)).to.eq(start);
    expect(Number(stream.end_time)).to.eq(end);
    expect(Number(stream.cliff_time)).to.eq(0);
    expect(stream.cancelled).to.eq(false);

    const vaultBalance = await getTokenBalance(provider.connection, vaultPDA);
    expect(vaultBalance).to.eq(amount);

    const senderBalance = await getTokenBalance(provider.connection, senderTokenAccount);
    expect(senderBalance).to.eq(1_000_000_000 - amount);
  });

  it.skip("creates stream with cliff_time in [start, end]", async () => {
    const { provider, program, mint, senderTokenAccount, sender, recipient } =
      await getTestContext();

    const start = now() + 120;
    const cliff = start + 1800;
    const end = cliff + 3600;
    const amount = 50_000_000;

    const { streamPDA } = await createStreamIx(
      program,
      sender,
      recipient.publicKey,
      amount,
      start,
      end,
      cliff,
      senderTokenAccount,
      mint,
    );

    const tx = new anchor.web3.Transaction().add(
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
          vault: (await findVaultPDA(streamPDA))[0],
          senderToken: senderTokenAccount,
          mint,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .instruction(),
    );
    await provider.sendAndConfirm(tx, [sender]);

    const stream = await program.account.streamAccount.fetch(streamPDA);
    expect(Number(stream.cliff_time)).to.eq(cliff);
    expect(Number(stream.amount)).to.eq(amount);
  });

  describe("edge cases \u2014 validation", () => {
    it.skip("rejects start_time >= end_time", async () => {
      const { provider, program, mint, senderTokenAccount, sender, recipient } =
        await getTestContext();

      const start = now() + 60;
      const end = start - 10;

      try {
        const { ix } = await createStreamIx(
          program,
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          0,
          senderTokenAccount,
          mint,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidTimeRange");
      }
    });

    it.skip("rejects cliff_time outside [start_time, end_time]", async () => {
      const { provider, program, mint, senderTokenAccount, sender, recipient } =
        await getTestContext();

      const start = now() + 60;
      const end = start + 3600;
      const cliff = end + 100;

      try {
        const { ix } = await createStreamIx(
          program,
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          cliff,
          senderTokenAccount,
          mint,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidCliffTime");
      }
    });

    it.skip("rejects cliff_time before start_time", async () => {
      const { provider, program, mint, senderTokenAccount, sender, recipient } =
        await getTestContext();

      const start = now() + 60;
      const cliff = start - 60;
      const end = start + 3600;

      try {
        const { ix } = await createStreamIx(
          program,
          sender,
          recipient.publicKey,
          100_000_000,
          start,
          end,
          cliff,
          senderTokenAccount,
          mint,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidCliffTime");
      }
    });

    it.skip("rejects zero amount", async () => {
      const { provider, program, mint, senderTokenAccount, sender, recipient } =
        await getTestContext();

      const start = now() + 60;
      const end = start + 3600;

      try {
        const { ix } = await createStreamIx(
          program,
          sender,
          recipient.publicKey,
          0,
          start,
          end,
          0,
          senderTokenAccount,
          mint,
        );
        const tx = new anchor.web3.Transaction().add(ix);
        await provider.sendAndConfirm(tx, [sender]);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.include("InvalidAmount");
      }
    });
  });
});
