import { BN } from "@coral-xyz/anchor";

import type { StreamDetail } from "@/hooks/use-stream-detail";
import { formatSol } from "@/utils/format";

export function StreamAmounts({ detail }: { detail: StreamDetail }) {
  const total = new BN(detail.amount);
  const withdrawn = new BN(detail.amountWithdrawn);
  const claimable = detail.claimable;
  const remaining = total.sub(withdrawn);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Amounts</h3>
      <div className="grid grid-cols-2 gap-3">
        <AmountCard label="Total" value={formatSol(total, 6)} />
        <AmountCard label="Withdrawn" value={formatSol(withdrawn, 6)} />
        <AmountCard
          label="Claimable"
          value={formatSol(claimable, 6)}
          highlight={claimable.gt(new BN(0))}
        />
        <AmountCard label="Remaining" value={formatSol(remaining, 6)} />
      </div>
    </div>
  );
}

function AmountCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg0 p-3">
      <p className="text-xs text-dim">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-green-400" : "text-text"}`}>{value}</p>
    </div>
  );
}
