import { fetchTokenMetadata } from "@solana-tdp/sdk";
import type { TokenMetadata } from "@solana-tdp/sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";

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

export function useOwnedTokens() {
  const { connection } = useConnection();
  const { publicKey } = useAuth();

  const { data: tokens = [], isLoading: loading } = useQuery({
    queryKey: ["owned-tokens", publicKey?.toBase58(), connection.rpcEndpoint],
    queryFn: async (): Promise<TokenInfo[]> => {
      if (!publicKey) return [];
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 10_000),
      );
      try {
        const accounts = await Promise.race([
          connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }),
          timeout,
        ]);
        const mints = accounts.value
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

        return mints.map((t) => {
          const meta = metaMap.get(t.mint.toBase58()) ?? null;
          return Object.assign(t, { meta });
        });
      } catch {
        return [];
      }
    },
    enabled: !!publicKey,
    staleTime: 30_000,
  });

  return { tokens, loading };
}
