import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";
import { compressImage } from "@/lib/compress-image";
import { useAuth } from "@/lib/solana/use-auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

interface CreatePlatformForm {
  name: string;
  symbol: string;
  decimals: number;
  amount: string;
  image?: File;
}

interface CreatePlatformResult {
  mintAddress: string;
  txSignature: string;
  name: string;
  symbol: string;
}

async function uploadImage(file: File, token: string): Promise<string> {
  const compressed = await compressImage(file);
  const uploadFile = new File([compressed], file.name, { type: "image/webp" });
  const form = new FormData();
  form.append("file", uploadFile);
  const res = await fetch(`${API_BASE}/api/tokens/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const errBody: unknown = await res.json();
    const errMsg =
      errBody && typeof errBody === "object" && "error" in errBody
        ? String((errBody as Record<string, unknown>).error)
        : "Failed to upload image";
    throw new Error(errMsg);
  }
  const body: unknown = await res.json();
  if (!body || typeof body !== "object" || !("url" in body)) {
    throw new Error("Invalid upload response");
  }
  return String((body as Record<string, unknown>).url);
}

export function useCreatePlatformToken() {
  const { publicKey } = useAuth();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePlatformForm): Promise<CreatePlatformResult> => {
      if (!publicKey) throw new Error("Wallet not connected");

      const privyToken = await getAccessToken();
      if (!privyToken) throw new Error("Not authenticated");

      const imageUrl = input.image ? await uploadImage(input.image, privyToken) : undefined;

      return api.post<CreatePlatformResult>(
        "/api/tokens/create-platform",
        {
          name: input.name,
          symbol: input.symbol,
          decimals: input.decimals,
          amount: input.amount,
          creatorAddress: publicKey.toBase58(),
          imageUrl,
        },
        privyToken,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      void queryClient.invalidateQueries({ queryKey: ["owned-tokens"] });
      toast.success("Token created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create token");
    },
  });
}
