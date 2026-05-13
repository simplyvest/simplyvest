import * as anchor from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, SystemProgram } from "@solana/web3.js";
import { PublicKey, Keypair } from "@solana/web3.js";

export const PROGRAM_ID = new anchor.web3.PublicKey(
  "6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk",
);

export const findStreamPDA = (
  sender: PublicKey,
  recipient: PublicKey,
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from("stream"), sender.toBuffer(), recipient.toBuffer()],
    PROGRAM_ID,
  );
};

export const findVaultPDA = (stream: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from("vault"), stream.toBuffer()],
    PROGRAM_ID,
  );
};

export const now = () => Math.floor(Date.now() / 1000);

export const getTokenBalance = async (
  connection: anchor.web3.Connection,
  account: PublicKey,
): Promise<number> => {
  const info = await connection.getTokenAccountBalance(account);
  return parseInt(info.value.amount);
};

export const createStreamIx = async (
  program: anchor.Program,
  sender: Keypair,
  recipient: PublicKey,
  amount: number | bigint,
  startTime: number | bigint,
  endTime: number | bigint,
  cliffTime: number | bigint,
  senderTokenAccount: PublicKey,
  mint: PublicKey,
) => {
  const [streamPDA] = await findStreamPDA(sender.publicKey, recipient);
  const [vaultPDA] = await findVaultPDA(streamPDA);

  const ix = await program.methods
    .createStream({
      amount: new anchor.BN(amount),
      startTime: new anchor.BN(startTime),
      endTime: new anchor.BN(endTime),
      cliffTime: new anchor.BN(cliffTime),
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

  return { streamPDA, vaultPDA, ix };
};

export const createStreamTx = async (
  program: anchor.Program,
  sender: Keypair,
  recipient: PublicKey,
  amount: number | bigint,
  startTime: number | bigint,
  endTime: number | bigint,
  cliffTime: number | bigint,
  senderTokenAccount: PublicKey,
  mint: PublicKey,
) => {
  const [streamPDA] = await findStreamPDA(sender.publicKey, recipient);

  const tx = await program.methods
    .createStream({
      amount: new anchor.BN(amount),
      startTime: new anchor.BN(startTime),
      endTime: new anchor.BN(endTime),
      cliffTime: new anchor.BN(cliffTime),
    })
    .accounts({
      sender: sender.publicKey,
      recipient,
      stream: streamPDA,
      vault: (await findVaultPDA(streamPDA))[0],
      senderToken: senderTokenAccount,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .transaction();

  return { streamPDA, tx };
};
