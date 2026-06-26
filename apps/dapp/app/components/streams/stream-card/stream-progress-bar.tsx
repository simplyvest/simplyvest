import type { BN } from "@coral-xyz/anchor";

import { formatDate } from "@/utils/format";

export function StreamProgressBar({
  progress,
  startTime,
  endTime,
}: {
  progress: number;
  startTime: BN;
  endTime: BN;
}) {
  return (
    <div className="pt-1">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="font-mono text-xs text-dim">{Math.round(progress)}%</span>
      </div>
      <div className="mt-1 flex justify-between font-mono text-xs text-dim">
        <span>{formatDate(startTime)}</span>
        <span>{formatDate(endTime)}</span>
      </div>
    </div>
  );
}
