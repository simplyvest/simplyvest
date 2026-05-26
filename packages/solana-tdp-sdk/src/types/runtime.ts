import type { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

export interface StreamAccount {
  creator: PublicKey;
  recipient: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  amount: BN;
  amountWithdrawn: BN;
  startTime: BN;
  cliffTime: BN;
  endTime: BN;
  vestingCount: BN;
  cancelled: boolean;
  bump: number;
  vaultBump: number;
}

export interface MilestoneStreamAccount {
  creator: PublicKey;
  recipient: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  amount: BN;
  amountWithdrawn: BN;
  milestoneAuthority: PublicKey;
  milestoneReached: boolean;
  cancelled: boolean;
  vestingCount: BN;
  bump: number;
  vaultBump: number;
}

export interface CreatorConfig {
  creator: PublicKey;
  vestingCount: BN;
}
