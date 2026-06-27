import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { StreamType, StreamStatus } from "@/hooks/use-stream-detail";

import { StreamStatusBadge } from "./stream-status-badge";

const typeLabels: Record<StreamType, string> = {
  linear: "Linear Stream",
  cliff: "Cliff Stream",
  milestone: "Milestone Stream",
};

export function StreamDetailLayout({
  streamType,
  status,
  tokenName,
  tokenSymbol,
  mintAddress,
  children,
}: {
  streamType: StreamType;
  status: StreamStatus;
  tokenName?: string;
  tokenSymbol?: string;
  mintAddress?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" search={{ tab: "created" }} className="text-sm text-dim hover:text-text">
          ← Back
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-text leading-tight">
            {tokenName ?? (mintAddress ? mintAddress.slice(0, 8) + "..." : "Stream")}
            {tokenSymbol && (
              <span className="ml-1.5 font-mono text-sm font-normal text-dim">({tokenSymbol})</span>
            )}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-dim">{typeLabels[streamType]}</span>
            <StreamStatusBadge status={status} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
