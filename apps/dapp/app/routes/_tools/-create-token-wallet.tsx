import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { FundWalletModal } from "@/components/tools/fund-wallet-modal";
import { TokenCreatorForm } from "@/components/tools/token-creator-form";
import { TokenCreatorSuccess } from "@/components/tools/token-creator-success";
import { useCreateToken } from "@/hooks/use-create-token";
import { SOL_THRESHOLD, useSolBalance } from "@/hooks/use-sol-balance";
import { useAuth } from "@/lib/solana/use-auth";

const SOLANA_EXPLORER = import.meta.env.VITE_SOLANA_EXPLORER ?? "https://explorer.solana.com";

function getChain(): string {
  const envChain = import.meta.env.VITE_SOLANA_CHAIN;
  return typeof envChain === "string" ? envChain : "solana:devnet";
}

export function CreateTokenWallet() {
  const mutation = useCreateToken();
  const { publicKey } = useAuth();
  const { balance, isFetching, isFetched, refetch } = useSolBalance();

  const [phase, setPhase] = useState<"sol-check" | "form" | "fund-wallet">("sol-check");
  const [result, setResult] = useState<{
    mintAddress: string;
    txSignature: string;
    name: string;
    symbol: string;
  } | null>(null);

  useEffect(() => {
    if (phase !== "sol-check") return;
    if (isFetching || !isFetched) return;
    if (balance >= SOL_THRESHOLD) {
      setPhase("form");
    } else {
      setPhase("fund-wallet");
    }
  }, [phase, balance, isFetching, isFetched]);

  const handleFunded = useCallback(async () => {
    const { data } = await refetch();
    if (data !== undefined && data >= SOL_THRESHOLD) {
      setPhase("form");
    }
  }, [refetch]);

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
      {phase === "sol-check" && (
        <div className="flex items-center justify-center py-12">
          <p className="animate-pulse text-sm text-muted">Checking wallet balance...</p>
        </div>
      )}

      {phase === "fund-wallet" && publicKey && (
        <FundWalletModal
          open
          onOpenChange={() => setPhase("form")}
          walletAddress={publicKey.toBase58()}
          currentBalance={balance}
          onFunded={handleFunded}
        />
      )}

      {phase === "form" && (
        <>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs text-muted">Creating with Wallet</p>
            <Link
              to="/tools/create-token"
              className="text-xs text-dim no-underline transition-colors hover:text-text hover:no-underline"
            >
              Change mode
            </Link>
          </div>
          <TokenCreatorForm
            mode="wallet"
            onSubmit={(data) =>
              mutation.mutate(data, {
                onSuccess: (res) => setResult(res),
              })
            }
            isPending={mutation.isPending}
          />
        </>
      )}
    </div>
  );
}
