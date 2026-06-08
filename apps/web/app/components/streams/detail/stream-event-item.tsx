import { formatAddress } from "@solana-tdp/sdk";

import type { StreamEventRecord } from "@/hooks/use-stream-events";
import { formatDate, formatSol } from "@/utils/format";

const eventLabels: Record<StreamEventRecord["eventType"], string> = {
  created: "Created",
  withdrawn: "Tokens Claimed",
  milestone_triggered: "Milestone Reached",
  completed: "Completed",
  cancelled: "Cancelled",
};

const eventColors: Record<StreamEventRecord["eventType"], string> = {
  created: "text-dim",
  withdrawn: "text-blue-400",
  milestone_triggered: "text-purple-400",
  completed: "text-green-400",
  cancelled: "text-red-400",
};

export function StreamEventItem({ event }: { event: StreamEventRecord }) {
  const explorerUrl = `https://explorer.solana.com/tx/${event.txSignature}?cluster=devnet`;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-border2" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${eventColors[event.eventType]}`}>
            {eventLabels[event.eventType]}
          </span>
          {event.amount && (
            <span className="text-xs text-dim">{formatSol(Number(event.amount), 6)} tokens</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-dim">
          <span>{formatAddress(event.actorAddress)}</span>
          <span>·</span>
          <span>{formatDate(event.blockTime)}</span>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text"
          >
            TX
          </a>
        </div>
      </div>
    </div>
  );
}
