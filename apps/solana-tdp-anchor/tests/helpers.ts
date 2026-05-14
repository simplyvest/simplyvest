import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const PROGRAM_ID = new PublicKey(
  "6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk",
);

export const findStreamPDA = (
  creator: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  vestingCount: BN,
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from("stream"),
      creator.toBuffer(),
      recipient.toBuffer(),
      mint.toBuffer(),
      vestingCount.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID,
  );
};

export const findVaultPDA = (stream: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from("vault"), stream.toBuffer()],
    PROGRAM_ID,
  );
};

export const findCreatorConfigPDA = (
  creator: PublicKey,
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from("creator_config"), creator.toBuffer()],
    PROGRAM_ID,
  );
};

export const now = () => Math.floor(Date.now() / 1000);
