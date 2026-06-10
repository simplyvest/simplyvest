import { useNavigate } from "@tanstack/react-router";
import { LuCheck, LuExternalLink, LuPlus } from "react-icons/lu";

import { Button } from "@/components/ui/button";

interface TokenCreatorSuccessProps {
  mintAddress: string;
  txSignature: string;
  name: string;
  symbol: string;
  explorerUrl: string;
}

export function TokenCreatorSuccess({
  mintAddress,
  txSignature,
  name,
  symbol,
  explorerUrl,
}: TokenCreatorSuccessProps) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-sol/10 p-3">
          <LuCheck className="h-12 w-12 text-sol" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text">Token Created</h2>
        <p className="mt-1 text-muted">
          {name} ({symbol})
        </p>
      </div>

      <div className="rounded-xl border border-border bg-bg1 p-4 space-y-2 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Mint Address</span>
          <span className="font-mono text-text">
            {mintAddress.slice(0, 8)}...{mintAddress.slice(-8)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Transaction</span>
          <span className="font-mono text-text">
            {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="default"
          onClick={() => window.open(explorerUrl, "_blank", "noopener noreferrer")}
        >
          <LuExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            navigate({
              to: "/app/create",
              search: { mint: mintAddress },
            })
          }
        >
          <LuPlus className="mr-2 h-4 w-4" />
          Create Stream with this Token
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/app/tools/tokens" })}>
          View All Tokens
        </Button>
      </div>
    </div>
  );
}
