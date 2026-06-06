import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import { SOLANA_TDP_PROGRAM_IDL, PROGRAM_ID } from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";
import { useConnection } from "@/lib/solana/use-connection";
import type { VersionedTransaction, Transaction } from "@solana/web3.js";
import { useMemo } from "react";

// TODO: look into proper typing — Anchor Wallet<T> generic variance mismatches WalletContextState
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const dummyWallet: Wallet = {
  publicKey: PROGRAM_ID,
  signTransaction: async <T extends VersionedTransaction | Transaction>(t: T) => t,
  signAllTransactions: async <T extends VersionedTransaction | Transaction>(ts: T[]) => ts,
} as unknown as Wallet;

export function useProgram() {
  const { connection } = useConnection();

  return useMemo(() => {
    const provider = new AnchorProvider(connection, dummyWallet, {
      commitment: "confirmed",
    });
    return new Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);
  }, [connection]);
}
