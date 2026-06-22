import type { StreamWithEvents } from "@/hooks/use-stream-api";

interface OrgTokenStatsProps {
  streams: StreamWithEvents[];
  tokenDecimals: number;
  tokenSymbol: string;
}

function formatAmount(amount: string, decimals: number): string {
  const n = Number(amount) / 10 ** decimals;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export function OrgTokenStats({ streams, tokenDecimals, tokenSymbol }: OrgTokenStatsProps) {
  const activeStreams = streams.filter((s) => s.status === "active");
  const totalVested = streams.reduce((sum, s) => sum + BigInt(s.amount), 0n);
  const totalClaimed = streams.reduce((sum, s) => sum + BigInt(s.amountWithdrawn ?? "0"), 0n);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-border bg-bg1 p-3 text-center">
        <p className="text-xl font-bold text-text">{activeStreams.length}</p>
        <p className="text-xs text-muted">Active Vests</p>
      </div>
      <div className="rounded-lg border border-border bg-bg1 p-3 text-center">
        <p className="text-xl font-bold text-text">
          {formatAmount(totalVested.toString(), tokenDecimals)}
        </p>
        <p className="text-xs text-muted">Total Vested {tokenSymbol}</p>
      </div>
      <div className="rounded-lg border border-border bg-bg1 p-3 text-center">
        <p className="text-xl font-bold text-text">
          {formatAmount(totalClaimed.toString(), tokenDecimals)}
        </p>
        <p className="text-xs text-muted">Total Claimed {tokenSymbol}</p>
      </div>
    </div>
  );
}
