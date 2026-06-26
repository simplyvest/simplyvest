import { usePrivy } from "@privy-io/react-auth";
import { createTokenInstructions } from "@solana-tdp/sdk";
import { Keypair } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";
import { compressImage } from "@/lib/compress-image";
import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";
import { useSolanaTransaction } from "@/lib/solana/use-solana-transaction";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

interface CreateTokenForm {
  name: string;
  symbol: string;
  decimals: number;
  amount: string;
  image?: File;
}

interface CreateTokenResult {
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
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const err = (await res.json()) as { error: string };
    throw new Error(err.error || "Failed to upload image");
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const data = (await res.json()) as { url: string };
  return data.url;
}

async function uploadMetadata(
  name: string,
  symbol: string,
  imageUrl: string,
  token: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/tokens/metadata`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, symbol, imageUrl }),
  });
  if (!res.ok) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const err = (await res.json()) as { error: string };
    throw new Error(err.error || "Failed to upload metadata");
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const data = (await res.json()) as { uri: string };
  return data.uri;
}

export function useCreateToken() {
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { sendInstructions } = useSolanaTransaction();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTokenForm): Promise<CreateTokenResult> => {
      if (!publicKey) throw new Error("Wallet not connected");

      const privyToken = await getAccessToken();
      if (!privyToken) throw new Error("Not authenticated");

      const imageUrl = input.image ? await uploadImage(input.image, privyToken) : "";

      const metadataUri = await uploadMetadata(input.name, input.symbol, imageUrl, privyToken);

      const mint = Keypair.generate();
      const supply = BigInt(Math.floor(Number(input.amount) * 10 ** input.decimals));

      const instructions = createTokenInstructions({
        payer: publicKey,
        mint,
        decimals: input.decimals,
        amount: supply,
        metadataUri,
        name: input.name,
        symbol: input.symbol,
      });

      const { signature } = await sendInstructions(connection, publicKey, instructions, {
        signers: [mint],
      });

      await api.post("/api/tokens", {
        mintAddress: mint.publicKey.toBase58(),
        creatorAddress: publicKey.toBase58(),
        name: input.name,
        symbol: input.symbol,
        decimals: input.decimals,
        supply: supply.toString(),
        metadataUri,
      });

      return {
        mintAddress: mint.publicKey.toBase58(),
        txSignature: signature,
        name: input.name,
        symbol: input.symbol,
      };
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
