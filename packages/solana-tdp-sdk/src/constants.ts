import { PublicKey } from "@solana/web3.js";

import SolanaTdpIdl from "./idl/solana_tdp.json";

export const PROGRAM_ID = new PublicKey(SolanaTdpIdl.address);

/** Anchor account discriminators (first 8 bytes of account data) */
export const DISCRIMINATORS = {
  StreamAccount: [243, 60, 164, 106, 199, 192, 110, 53],
  MilestoneStreamAccount: [32, 129, 16, 253, 73, 199, 39, 42],
  CreatorConfig: [208, 169, 98, 27, 194, 199, 95, 86],
} as const;

/** Account data sizes (bytes) */
export const ACCOUNT_SIZES = {
  StreamAccount: 187,
  MilestoneStreamAccount: 196,
} as const;
