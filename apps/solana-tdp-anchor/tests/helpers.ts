import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
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
