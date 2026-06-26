import { Link } from "@tanstack/react-router";

import type { StreamWithEvents } from "@/hooks/use-stream-api";

interface OrgVestListProps {
  streams: StreamWithEvents[];
  tokenDecimals: number;
}

function formatAmount(amount: string, decimals: number): string {
  const n = Number(amount) / 10 ** decimals;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

function VestProgress({ stream }: { stream: StreamWithEvents }) {
  const total = Number(stream.amount);
  const withdrawn = Number(stream.amountWithdrawn ?? "0");
  const pct = total > 0 ? Math.min(100, (withdrawn / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg2">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted">{pct.toFixed(0)}%</span>
    </div>
  );
}

export function OrgVestList({ streams, tokenDecimals }: OrgVestListProps) {
  if (streams.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-6 text-center">
        <p className="text-sm text-muted">No vesting streams for this organization yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-bg2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="flex-1">Recipient</span>
        <span className="w-24 text-right">Amount</span>
        <span className="w-24 text-right">Progress</span>
      </div>
      {streams.map((stream) => (
        <Link
          key={stream.id}
          to="/streams/$streamPda"
          params={{ streamPda: stream.id }}
          className="flex items-center justify-between border-t border-border px-4 py-3 hover:bg-bg2 no-underline"
        >
          <span className="flex-1 text-sm text-text font-mono truncate">
            {stream.recipientAddress.slice(0, 6)}...{stream.recipientAddress.slice(-4)}
          </span>
          <span className="w-24 text-right text-sm text-text">
            {formatAmount(stream.amount, tokenDecimals)}
          </span>
          <div className="w-24 flex justify-end">
            <VestProgress stream={stream} />
          </div>
        </Link>
      ))}
    </div>
  );
}
