import { useCallback, useEffect, useState } from "react";

import { FundWalletModal } from "@/components/tools/fund-wallet-modal";
import { ModeChoiceModal } from "@/components/tools/mode-choice-modal";
import { TokenCreatorForm } from "@/components/tools/token-creator-form";
import { TokenCreatorSuccess } from "@/components/tools/token-creator-success";
import { useCreatePlatformToken } from "@/hooks/use-create-platform-token";
import { useCreateToken } from "@/hooks/use-create-token";
import { SOL_THRESHOLD, useSolBalance } from "@/hooks/use-sol-balance";
import { useAuth } from "@/lib/solana/use-auth";

const SOLANA_EXPLORER = import.meta.env.VITE_SOLANA_EXPLORER ?? "https://explorer.solana.com";

type Mode = "platform" | "wallet";
type Phase = "mode-choice" | "sol-check" | "form" | "fund-wallet";

function getChain(): string {
  const envChain = import.meta.env.VITE_SOLANA_CHAIN;
  return typeof envChain === "string" ? envChain : "solana:devnet";
}

export function CreateTokenPage() {
  const createToken = useCreateToken();
  const createPlatformToken = useCreatePlatformToken();
  const { publicKey } = useAuth();
  const { balance, isFetching, isFetched, refetch } = useSolBalance();

  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("mode-choice");
  const [result, setResult] = useState<{
    mintAddress: string;
    txSignature: string;
    name: string;
    symbol: string;
  } | null>(null);

  const handleSelectMode = useCallback((m: Mode) => {
    setMode(m);
    if (m === "platform") {
      setPhase("form");
    } else {
      setPhase("sol-check");
    }
  }, []);

  // Wait for SOL balance fetch to complete, then decide next phase
  useEffect(() => {
    if (mode !== "wallet" || phase !== "sol-check") return;
    if (isFetching || !isFetched) return;
    if (balance >= SOL_THRESHOLD) {
      setPhase("form");
    } else {
      setPhase("fund-wallet");
    }
  }, [mode, phase, balance, isFetching, isFetched]);

  const handleFunded = useCallback(async () => {
    const { data } = await refetch();
    if (data !== undefined && data >= SOL_THRESHOLD) {
      setPhase("form");
    }
  }, [refetch]);

  const activeMutation = mode === "platform" ? createPlatformToken : createToken;

  // Success
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
      {/* Mode Choice Modal */}
      <ModeChoiceModal
        open={phase === "mode-choice"}
        onOpenChange={(open) => {
          if (!open) window.history.back();
        }}
        onSelectMode={handleSelectMode}
      />

      {/* SOL check loading */}
      {phase === "sol-check" && (
        <div className="flex items-center justify-center py-12">
          <p className="animate-pulse text-sm text-muted">Checking wallet balance...</p>
        </div>
      )}

      {/* Fund Wallet Modal */}
      {phase === "fund-wallet" && publicKey && (
        <FundWalletModal
          open
          onOpenChange={() => setPhase("mode-choice")}
          walletAddress={publicKey.toBase58()}
          currentBalance={balance}
          onFunded={handleFunded}
        />
      )}

      {/* Form */}
      {phase === "form" && mode && (
        <TokenCreatorForm
          mode={mode}
          onSubmit={(data) =>
            activeMutation.mutate(data, {
              onSuccess: (res) => setResult(res),
            })
          }
          isPending={activeMutation.isPending}
        />
      )}

      {/* Back button when in form mode */}
      {phase === "form" && (
        <button
          type="button"
          onClick={() => setPhase("mode-choice")}
          className="mt-4 w-full text-center text-xs text-muted transition-colors hover:text-text"
        >
          Change creation mode
        </button>
      )}
    </div>
  );
}
