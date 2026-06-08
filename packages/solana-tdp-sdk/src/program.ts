import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import type { Connection, VersionedTransaction, Transaction } from "@solana/web3.js";

import type { SolanaTdp } from "./types/solana_tdp";

import { PROGRAM_ID } from "./constants";
import SolanaTdpIdl from "./idl/solana_tdp.json";

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const SOLANA_TDP_PROGRAM_IDL = SolanaTdpIdl as unknown as SolanaTdp;

/**
 * Build a read-only Anchor Program instance (no signing capability).
 * Use for fetching accounts, building instructions, or reading on-chain state.
 */
export function buildReadProgram(connection: Connection): Program<SolanaTdp> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const dummyWallet = {
    publicKey: PROGRAM_ID,
    signTransaction: async <T extends VersionedTransaction | Transaction>(tx: T) => tx,
    signAllTransactions: async <T extends VersionedTransaction | Transaction>(txs: T[]) => txs,
  } as unknown as Wallet;

  const provider = new AnchorProvider(connection, dummyWallet, {
    commitment: "confirmed",
  });

  return new Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);
}
