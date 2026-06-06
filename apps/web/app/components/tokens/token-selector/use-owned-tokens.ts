import { fetchTokenMetadata } from "@solana-tdp/sdk";
import type { TokenMetadata } from "@solana-tdp/sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect } from "react";

interface TokenInfo {
  mint: PublicKey;
  balance: bigint;
  address: PublicKey;
  meta: TokenMetadata | null;
}

function mintToAddress(mint: PublicKey | null): string {
  return mint?.toBase58() ?? "";
}

export type { TokenInfo };
export { mintToAddress };

export function useOwnedTokens(): {
  tokens: TokenInfo[];
  loading: boolean;
} {
  const { connection } = useConnection();
  const { publicKey } = useAuth();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (publicKey) {
      setLoading(true);
      void (async () => {
        try {
          const { value: accounts } = await connection.getTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID,
          });
          const mints = accounts
            .map((acc) => {
              const data = Buffer.from(acc.account.data);
              const mint = new PublicKey(data.subarray(0, 32));
              const balance = data.readBigUInt64LE(64);
              return { mint, balance, address: acc.pubkey };
            })
            .filter((t) => t.balance > 0);
          mints.sort((a, b) => Number(b.balance - a.balance));
          const metaMap = new Map<string, TokenMetadata | null>();
          await Promise.all(
            mints.map(async (t) => {
              const key = t.mint.toBase58();
              if (!metaMap.has(key)) {
                const meta = await fetchTokenMetadata(connection, t.mint);
                metaMap.set(key, meta);
              }
            }),
          );
          if (cancelled) return;
          const list = mints.map((t) => {
            const meta = metaMap.get(t.mint.toBase58()) ?? null;
            return Object.assign(t, { meta });
          });
          setTokens(list);
        } catch {}
        if (!cancelled) setLoading(false);
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  return { tokens, loading };
}
