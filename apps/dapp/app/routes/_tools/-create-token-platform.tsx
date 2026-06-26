import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { TokenCreatorForm } from "@/components/tools/token-creator-form";
import { TokenCreatorSuccess } from "@/components/tools/token-creator-success";
import { useCreatePlatformToken } from "@/hooks/use-create-platform-token";

const SOLANA_EXPLORER = import.meta.env.VITE_SOLANA_EXPLORER ?? "https://explorer.solana.com";

function getChain(): string {
  const envChain = import.meta.env.VITE_SOLANA_CHAIN;
  return typeof envChain === "string" ? envChain : "solana:devnet";
}

export function CreateTokenPlatform() {
  const mutation = useCreatePlatformToken();
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
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs text-muted">Creating on Platform</p>
        <Link
          to="/tools/create-token"
          className="text-xs text-dim no-underline transition-colors hover:text-text hover:no-underline"
        >
          Change mode
        </Link>
      </div>
      <TokenCreatorForm
        mode="platform"
        onSubmit={(data) =>
          mutation.mutate(data, {
            onSuccess: (res) => setResult(res),
          })
        }
        isPending={mutation.isPending}
      />
    </div>
  );
}
