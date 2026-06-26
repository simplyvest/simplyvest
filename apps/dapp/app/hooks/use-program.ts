import type { Program } from "@coral-xyz/anchor";
import { buildReadProgram } from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";
import { useMemo } from "react";

import { useConnection } from "@/lib/solana/use-connection";

export function useProgram(): Program<SolanaTdp> {
  const { connection } = useConnection();
  return useMemo(() => buildReadProgram(connection), [connection]);
}
