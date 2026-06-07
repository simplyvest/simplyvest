import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import {
  getStreamPda,
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
  getWithdrawAccounts,
  getCancelAccounts,
  getCreateMilestoneStreamAccounts,
  getTriggerMilestoneAccounts,
  getWithdrawMilestoneAccounts,
  getCancelMilestoneAccounts,
  SOLANA_TDP_PROGRAM_IDL,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";
import type { Connection } from "@solana/web3.js";

/** Build a read-only Anchor program (no signing) */
export function buildReadProgram(connection: Connection) {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const dummyWallet = {
    publicKey: PROGRAM_ID,
    signTransaction: async <T>(tx: T) => tx,
    signAllTransactions: async <T>(txs: T[]) => txs,
  } as unknown as Wallet;
  const provider = new AnchorProvider(connection, dummyWallet, {
    commitment: "confirmed",
  });
  return new Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);
}

export { BN, web3, PROGRAM_ID };
export {
  getStreamPda,
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
  getWithdrawAccounts,
  getCancelAccounts,
  getCreateMilestoneStreamAccounts,
  getTriggerMilestoneAccounts,
  getWithdrawMilestoneAccounts,
  getCancelMilestoneAccounts,
};
