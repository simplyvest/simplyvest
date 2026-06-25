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
  children,
}: {
  streamType: StreamType;
  status: StreamStatus;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app" search={{ tab: "created" }} className="text-sm text-dim hover:text-text">
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-text">{typeLabels[streamType]}</h1>
          <StreamStatusBadge status={status} />
        </div>
      </div>
      {children}
    </div>
  );
}
