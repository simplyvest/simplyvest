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

function isTokenRecordArray(val: unknown): val is TokenCreationRecord[] {
  return (
    Array.isArray(val) &&
    val.every((item) => typeof item === "object" && item !== null && "mintAddress" in item)
  );
}

function isTokenPreferences(val: unknown): val is TokenPreferences {
  if (typeof val !== "object" || val === null) return false;
  if (!("preferences" in val)) return false;
  return Array.isArray(val.preferences);
}

export function useTokenPreferences() {
  const { publicKey } = useAuth();
  const creatorAddress = publicKey?.toBase58();
  const queryClient = useQueryClient();

  const prefsQuery = useQuery({
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
      queryClient
        .getQueryCache()
        .findAll({ queryKey: TOKEN_LIST_KEY })
        .forEach((q) => {
          const raw = q.state.data;
          const data = isTokenRecordArray(raw) ? raw : undefined;
          prev.set(q.queryHash, data);
          queryClient.setQueryData(
            q.queryKey,
            (data ?? []).map((t) =>
              t.mintAddress === input.mintAddress
                ? Object.assign({}, t, { visible: input.visible })
                : t,
            ),
          );
        });

      // Optimistically update preferences query
      const prefsCacheEntry = queryClient.getQueryCache().find({ queryKey: prefsKey });
      const prefsData = prefsCacheEntry?.state.data;
      const prevPrefs = isTokenPreferences(prefsData) ? prefsData : undefined;
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
    preferences: prefsQuery.data ?? { tokenVisibilityMode: "hide_list" as const, preferences: [] },
    setVisibility,
    isLoading: prefsQuery.isLoading,
  };
}
