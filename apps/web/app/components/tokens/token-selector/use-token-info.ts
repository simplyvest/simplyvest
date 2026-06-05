import { fetchTokenMetadata, formatTokenLabel } from "@solana-tdp/sdk";
import { useConnection } from "@solana/wallet-adapter-react";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useRef, useState } from "react";

export interface TokenInfoState {
  label: string | null;
  error: string | null;
  loading: boolean;
}

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Read the decimals field from an SPL Token mint account. */
async function getMintDecimals(connection: Connection, mintAddr: PublicKey): Promise<number> {
  const info = await connection.getAccountInfo(mintAddr, { commitment: "confirmed" });
  if (!info || !info.data || info.data.length < 46) throw new Error("Invalid mint");
  // Mint layout: mintAuthorityOption(4) + mintAuthority(32) + supply(8) + decimals(1)
  return info.data[44]; // uint8 at fixed offset
}

/**
 * Debounced token metadata resolver.
 * Returns label (e.g. "USDC — 6 decimals"), error, or loading state.
 */
export function useTokenInfo(mintAddress: string): TokenInfoState {
  const { connection } = useConnection();
  const [state, setState] = useState<TokenInfoState>({
    label: null,
    error: null,
    loading: false,
  });
  const cancelledRef = useRef(false);

  useEffect(() => {
    const addr = mintAddress.trim();

    // Empty — reset
    if (!addr) {
      setState({ label: null, error: null, loading: false });
      return () => {};
    }

    // Invalid format
    if (!MINT_RE.test(addr)) {
      setState({ label: null, error: "Invalid mint address", loading: false });
      return () => {};
    }

    cancelledRef.current = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const timer = setTimeout(async () => {
      try {
        const mint = new PublicKey(addr);
        const [meta, decimals] = await Promise.all([
          fetchTokenMetadata(connection, mint),
          getMintDecimals(connection, mint),
        ]);
        if (cancelledRef.current) return;
        const name = formatTokenLabel(meta, mint);
        setState({ label: `${name} — ${decimals} decimals`, error: null, loading: false });
      } catch {
        if (cancelledRef.current) return;
        setState({ label: null, error: "Token not found", loading: false });
      }
    }, 500);

    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [mintAddress, connection]);

  return state;
}
