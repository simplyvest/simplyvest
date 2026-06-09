import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/solana/use-auth";

interface TokenPreferences {
  tokenVisibilityMode: "hide_list" | "allow_list";
}

export function useTokenPreferences() {
  const { publicKey } = useAuth();
  const creatorAddress = publicKey?.toBase58();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["token-preferences", creatorAddress],
    queryFn: () => api.get<TokenPreferences>(`/api/tokens/preferences?creator=${creatorAddress}`),
    enabled: !!creatorAddress,
  });

  const setVisibility = useMutation({
    mutationFn: (input: { mintAddress: string; visible: boolean }) =>
      api.post<{ ok: boolean }>(`/api/tokens/${input.mintAddress}/visibility`, {
        visible: input.visible,
        creatorAddress,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update visibility");
    },
  });

  return {
    preferences: query.data ?? { tokenVisibilityMode: "hide_list" as const },
    setVisibility,
    isLoading: query.isLoading,
  };
}
