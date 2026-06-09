import { createRoute } from "@tanstack/react-router";
import { useState } from "react";

import { TokenCreatorForm } from "@/components/tools/token-creator-form";
import { TokenCreatorSuccess } from "@/components/tools/token-creator-success";
import { useCreateToken } from "@/hooks/use-create-token";

import { Route as ToolsRoute } from "./app.tools";

const SOLANA_EXPLORER = import.meta.env.VITE_SOLANA_EXPLORER ?? "https://explorer.solana.com";

function getChain(): string {
  const envChain = import.meta.env.VITE_SOLANA_CHAIN;
  return typeof envChain === "string" ? envChain : "solana:devnet";
}

export const Route = createRoute({
  getParentRoute: () => ToolsRoute,
  path: "/create-token",
  component: CreateTokenPage,
});

function CreateTokenPage() {
  const createToken = useCreateToken();
  const [result, setResult] = useState<{
    mintAddress: string;
    txSignature: string;
    name: string;
    symbol: string;
  } | null>(null);

  if (result) {
    const cluster = getChain() === "solana:mainnet" ? "" : "?cluster=devnet";
    return (
      <TokenCreatorSuccess
        mintAddress={result.mintAddress}
        txSignature={result.txSignature}
        name={result.name}
        symbol={result.symbol}
        explorerUrl={`${SOLANA_EXPLORER}/tx/${result.txSignature}${cluster}`}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <TokenCreatorForm
        onSubmit={(data) =>
          createToken.mutate(data, {
            onSuccess: (res) => setResult(res),
          })
        }
        isPending={createToken.isPending}
      />
    </div>
  );
}
