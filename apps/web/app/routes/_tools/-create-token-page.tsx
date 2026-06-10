import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { FundWalletModal } from "@/components/tools/fund-wallet-modal";
import { ModeChoiceModal } from "@/components/tools/mode-choice-modal";
import { TokenCreatorForm } from "@/components/tools/token-creator-form";
import { TokenCreatorSuccess } from "@/components/tools/token-creator-success";
import { useCreatePlatformToken } from "@/hooks/use-create-platform-token";
import { useCreateToken } from "@/hooks/use-create-token";
import { SOL_THRESHOLD, useSolBalance } from "@/hooks/use-sol-balance";
import { useAuth } from "@/lib/solana/use-auth";

import { Route } from "../app.tools.create-token";

const SOLANA_EXPLORER = import.meta.env.VITE_SOLANA_EXPLORER ?? "https://explorer.solana.com";

type Mode = "platform" | "wallet";
type Phase = "mode-choice" | "sol-check" | "form" | "fund-wallet";

function getChain(): string {
  const envChain = import.meta.env.VITE_SOLANA_CHAIN;
  return typeof envChain === "string" ? envChain : "solana:devnet";
}

function initialPhase(mode: Mode | undefined): Phase {
  if (!mode) return "mode-choice";
  if (mode === "wallet") return "sol-check";
  return "form";
}

export function CreateTokenPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();

  const createToken = useCreateToken();
  const createPlatformToken = useCreatePlatformToken();
  const { publicKey } = useAuth();
  const { balance, isFetching, isFetched, refetch } = useSolBalance();

  const [phase, setPhase] = useState<Phase>(() => initialPhase(mode));
  const [result, setResult] = useState<{
    mintAddress: string;
    txSignature: string;
    name: string;
    symbol: string;
  } | null>(null);

  const handleSelectMode = useCallback(
    (m: Mode) => {
      void navigate({ to: "/app/tools/create-token", search: { mode: m } });
    },
    [navigate],
  );

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
        onOpenChange={() => {}}
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
          onOpenChange={() => {
            void navigate({ to: "/app/tools/create-token", search: {} });
          }}
          walletAddress={publicKey.toBase58()}
          currentBalance={balance}
          onFunded={handleFunded}
        />
      )}

      {/* Form */}
      {phase === "form" && mode && (
        <>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs text-muted">
              {mode === "platform" ? "Creating on Platform" : "Creating with Wallet"}
            </p>
            <button
              type="button"
              onClick={() => {
                void navigate({ to: "/app/tools/create-token", search: {} });
              }}
              className="text-xs text-dim transition-colors hover:text-text"
            >
              Change mode
            </button>
          </div>
          <TokenCreatorForm
            mode={mode}
            onSubmit={(data) =>
              activeMutation.mutate(data, {
                onSuccess: (res) => setResult(res),
              })
            }
            isPending={activeMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
