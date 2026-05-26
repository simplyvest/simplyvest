import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk");

export const findStreamPDA = (
  creator: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  vestingCount: Uint8Array,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("stream"),
      creator.toBuffer(),
      recipient.toBuffer(),
      mint.toBuffer(),
      vestingCount,
    ],
    PROGRAM_ID,
  );
};

export const findVaultPDA = (stream: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), stream.toBuffer()],
    PROGRAM_ID,
  );
};

export const findCreatorConfigPDA = (creator: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("creator_config"), creator.toBuffer()],
    PROGRAM_ID,
  );
};
