import { fetchTokenMetadata, formatTokenLabel } from "@solana-tdp/sdk";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useConnection } from "@/lib/solana/use-connection";

export interface TokenInfoState {
  label: string | null;
  error: string | null;
  loading: boolean;
}

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

async function getMintDecimals(connection: Connection, mintAddr: PublicKey): Promise<number> {
  const info = await connection.getAccountInfo(mintAddr, { commitment: "confirmed" });
  if (!info || !info.data || info.data.length < 46) throw new Error("Invalid mint");
  return info.data[44];
}

export function useTokenInfo(mintAddress: string): TokenInfoState {
  const { connection } = useConnection();
  const addr = mintAddress.trim();
  const isValid = !!addr && MINT_RE.test(addr);

  const query = useQuery({
    queryKey: ["token-info", addr, connection.rpcEndpoint],
    queryFn: async () => {
      const mint = new PublicKey(addr);
      const [meta, decimals] = await Promise.all([
        fetchTokenMetadata(connection, mint),
        getMintDecimals(connection, mint),
      ]);
      const name = formatTokenLabel(meta, mint);
      return `${name} — ${decimals} decimals`;
    },
    enabled: isValid,
    staleTime: 60_000,
  });

  if (!addr) return { label: null, error: null, loading: false };
  if (!MINT_RE.test(addr)) return { label: null, error: "Invalid mint address", loading: false };

  return {
    label: query.data ?? null,
    error: query.isError ? "Token not found" : null,
    loading: query.isLoading,
  };
}
