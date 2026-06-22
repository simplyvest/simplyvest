import type { StreamDetail } from "@/hooks/use-stream-detail";
import { formatDate, formatDuration } from "@/utils/format";

export function StreamTimeline({ detail }: { detail: StreamDetail }) {
  if (detail.streamType === "milestone") {
    return <MilestoneTimeline detail={detail} />;
  }

  return <VestingTimeline detail={detail} />;
}

function VestingTimeline({ detail }: { detail: StreamDetail }) {
  const now = Math.floor(Date.now() / 1000);
  const start = detail.startTime ?? 0;
  const end = detail.endTime ?? 0;
  const cliff = detail.cliffTime ?? 0;
  const hasCliff = detail.streamType === "cliff" && cliff > start;

  const totalSec = end - start;
  const elapsedSec = Math.max(0, now - start);
  const remainingSec = Math.max(0, end - now);
  const progress = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Timeline</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-dim">Progress</span>
          <span className="text-text">{Math.round(detail.vestedPercent)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-bg2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-dim">
          <span>{formatDate(start)}</span>
          <span>{formatDate(end)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-dim">Start</p>
          <p className="text-text">{formatDate(start)}</p>
        </div>
        {hasCliff && (
          <div>
            <p className="text-dim">Cliff</p>
            <p className="text-text">{formatDate(cliff)}</p>
          </div>
        )}
        <div>
          <p className="text-dim">End</p>
          <p className="text-text">{formatDate(end)}</p>
        </div>
        <div>
          <p className="text-dim">Remaining</p>
          <p className="text-text">
            {detail.status === "active" ? formatDuration(remainingSec) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MilestoneTimeline({ detail }: { detail: StreamDetail }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Milestone</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-dim">Status</p>
          <p className="text-text">{detail.milestoneReached ? "Reached" : "Not reached"}</p>
        </div>
        <div>
          <p className="text-dim">Created</p>
          <p className="text-text">{formatDate(detail.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
