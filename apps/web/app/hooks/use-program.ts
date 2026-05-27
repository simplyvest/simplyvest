import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

import idl from "@/idl/solana_tdp.json";
import type { SolanaTdp } from "@/idl/solana_tdp.types";

export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new anchor.AnchorProvider(connection, wallet, {});
    return new anchor.Program<SolanaTdp>(idl as SolanaTdp, provider);
  }, [wallet, connection]);

  return program;
}
