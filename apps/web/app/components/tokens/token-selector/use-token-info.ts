import { fetchTokenMetadata, formatTokenLabel } from "@solana-tdp/sdk";
import { getMint } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState, useRef } from "react";

export interface TokenInfoState {
  label: string | null;
  error: string | null;
  loading: boolean;
}

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

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
        const [meta, mintInfo] = await Promise.all([
          fetchTokenMetadata(connection, mint),
          getMint(connection, mint),
        ]);
        if (cancelledRef.current) return;
        const name = formatTokenLabel(meta, mint);
        setState({ label: `${name} — ${mintInfo.decimals} decimals`, error: null, loading: false });
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
