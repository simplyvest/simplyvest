import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/solana/use-auth";

interface TokenCreationRecord {
  mintAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  metadataUri: string;
  createdAt: string;
  created_here: boolean;
  visible?: boolean;
}

export type { TokenCreationRecord };

export function useTokenList(filter?: "visible") {
  const { publicKey } = useAuth();
  const creatorAddress = publicKey?.toBase58();

  return useQuery({
    queryKey: ["api-tokens", creatorAddress, filter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (creatorAddress) params.set("creator", creatorAddress);
      if (filter === "visible") params.set("filter", "visible");
      return api.get<TokenCreationRecord[]>(`/api/tokens?${params.toString()}`);
    },
    enabled: !!creatorAddress,
    staleTime: 15_000,
  });
}
