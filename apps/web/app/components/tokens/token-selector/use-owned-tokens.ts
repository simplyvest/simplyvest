import { fetchTokenMetadata } from "@solana-tdp/sdk";
import type { TokenMetadata } from "@solana-tdp/sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";

const METADATA_RPC_URL =
  import.meta.env.VITE_SOLANA_METADATA_RPC_URL ??
  import.meta.env.VITE_SOLANA_RPC_URL ??
  "https://api.devnet.solana.com";

console.log("[useOwnedTokens] metadata RPC:", METADATA_RPC_URL.slice(0, 80));

let metadataConnection: Connection | null = null;
function getMetadataConnection(): Connection {
  if (!metadataConnection) {
    metadataConnection = new Connection(METADATA_RPC_URL, "confirmed");
  }
  return metadataConnection;
}

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
    queryFn: async () => {
      if (!publicKey) return [] as TokenInfo[];
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
            const meta = await fetchTokenMetadata(getMetadataConnection(), t.mint);
            metaMap.set(key, meta);
          }
        }),
      );

      return mints.map((t) => {
        const meta = metaMap.get(t.mint.toBase58()) ?? null;
        return Object.assign(t, { meta });
      });
    },
    enabled: !!publicKey,
    staleTime: 30_000,
  });

  return { tokens, loading };
}
