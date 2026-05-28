import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export const getStreamPda = (
  creator: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  vestingCount: BN,
  programId: PublicKey,
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from("stream"),
      creator.toBuffer(),
      recipient.toBuffer(),
      mint.toBuffer(),
      vestingCount.toArrayLike(Buffer, "le", 8),
    ],
    programId,
  );

export const getMilestoneStreamPda = (
  creator: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  vestingCount: BN,
  programId: PublicKey,
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from("milestone-stream"),
      creator.toBuffer(),
      recipient.toBuffer(),
      mint.toBuffer(),
      vestingCount.toArrayLike(Buffer, "le", 8),
    ],
    programId,
  );

export const getVaultPda = (stream: PublicKey, programId: PublicKey): [PublicKey, number] =>
  PublicKey.findProgramAddressSync([Buffer.from("vault"), stream.toBuffer()], programId);

export const getCreatorConfigPda = (
  creator: PublicKey,
  programId: PublicKey,
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync([Buffer.from("creator_config"), creator.toBuffer()], programId);
