import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";

export const SOL_THRESHOLD = 11_000_000; // 0.011 SOL

export function useSolBalance() {
  const { publicKey } = useAuth();
  const { connection } = useConnection();

  const query = useQuery({
    queryKey: ["sol-balance", publicKey?.toBase58()],
    queryFn: () => {
      if (!publicKey) return 0;
      return connection.getBalance(publicKey);
    },
    enabled: !!publicKey,
    staleTime: 15_000,
  });

  return {
    balance: query.data ?? 0,
    isFetching: query.isFetching,
    isFetched: query.isFetched,
    refetch: query.refetch,
  };
}
