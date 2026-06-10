import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/solana/use-auth";

import type { TokenCreationRecord } from "./use-token-list";

interface TokenPreferences {
  tokenVisibilityMode: "hide_list" | "allow_list";
  preferences: { mintAddress: string; visible: boolean }[];
}

const TOKEN_LIST_KEY = ["api-tokens"] as const;

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
      api.patch<{ ok: boolean }>(`/api/tokens/${input.mintAddress}/visibility`, {
        visible: input.visible,
        creatorAddress,
      }),
    onMutate: async (input) => {
      const prefsKey = ["token-preferences", creatorAddress] as const;
      await queryClient.cancelQueries({ queryKey: TOKEN_LIST_KEY });
      await queryClient.cancelQueries({ queryKey: prefsKey });

      const prev: Map<string, unknown> = new Map();

      // Optimistically update token list queries
      queryClient.getQueryCache().findAll({ queryKey: TOKEN_LIST_KEY }).forEach((q) => {
        const data = q.state.data as TokenCreationRecord[] | undefined;
        prev.set(q.queryHash, data);
        queryClient.setQueryData(
          q.queryKey,
          (data ?? []).map((t) =>
            t.mintAddress === input.mintAddress ? { ...t, visible: input.visible } : t,
          ),
        );
      });

      // Optimistically update preferences query
      const prefsQuery = queryClient.getQueryCache().find({ queryKey: prefsKey });
      const prevPrefs = prefsQuery?.state.data as TokenPreferences | undefined;
      if (prevPrefs) {
        prev.set("prefs", prevPrefs);
        const existing = prevPrefs.preferences.find((p) => p.mintAddress === input.mintAddress);
        const newPrefs = existing
          ? prevPrefs.preferences.map((p) =>
              p.mintAddress === input.mintAddress ? { ...p, visible: input.visible } : p,
            )
          : [...prevPrefs.preferences, { mintAddress: input.mintAddress, visible: input.visible }];
        queryClient.setQueryData(prefsKey, { ...prevPrefs, preferences: newPrefs });
      }

      return { prev };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TOKEN_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: ["token-preferences", creatorAddress] });
    },
    onError: (error, _input, context) => {
      if (context?.prev) {
        context.prev.forEach((data, hash) => {
          if (hash === "prefs") {
            queryClient.setQueryData(["token-preferences", creatorAddress], data);
          } else {
            const query = queryClient.getQueryCache().get(hash);
            if (query) {
              queryClient.setQueryData(query.queryKey, data);
            }
          }
        });
      }
      toast.error(error instanceof Error ? error.message : "Failed to update visibility");
    },
  });

  return {
    preferences: query.data ?? { tokenVisibilityMode: "hide_list" as const, preferences: [] },
    setVisibility,
    isLoading: query.isLoading,
  };
}
