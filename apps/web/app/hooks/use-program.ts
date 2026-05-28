import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import { SolanaTdpIdl, PROGRAM_ID } from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";
import { useConnection } from "@solana/wallet-adapter-react";
import type { VersionedTransaction, Transaction } from "@solana/web3.js";
import { useMemo } from "react";

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
    return new Program<SolanaTdp>(SolanaTdpIdl as SolanaTdp, provider);
  }, [connection]);
}
