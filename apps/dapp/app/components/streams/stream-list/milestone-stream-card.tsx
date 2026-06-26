import { Button } from "@simplyvest/ui/button";
import { Link } from "@tanstack/react-router";
import BN from "bn.js";

import { Badge } from "@/components/ui/badge";
import type { StreamWithEvents } from "@/hooks/use-stream-api";
import { formatSol } from "@/utils/format";

export function MilestoneStreamCard({
  stream,
  role,
  isRecipient,
  canTrigger,
  onTrigger,
  onCancel,
  onClaim,
  triggerPending,
  cancelPending,
  withdrawPending,
}: {
  stream: StreamWithEvents;
  role: "created" | "received";
  isRecipient: boolean;
  canTrigger: boolean;
  onTrigger: () => void;
  onCancel: () => void;
  onClaim: () => void;
  triggerPending: boolean;
  cancelPending: boolean;
  withdrawPending: boolean;
}) {
  const milestoneReached = stream.milestoneReached ?? false;
  const cancelled = stream.status === "cancelled";

  return (
    <div className="rounded-xl border border-border bg-bg1 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <Link
          to="/streams/$streamPda"
          params={{ streamPda: stream.id }}
          className="min-w-0 flex-1 space-y-1 no-underline hover:no-underline"
        >
          <div className="flex items-center gap-2">
            <Badge variant={cancelled ? "warn" : milestoneReached ? "sol2" : "sol"}>
              {cancelled ? "cancelled" : milestoneReached ? "completed" : "active"}
            </Badge>
            <span className="font-mono text-xs text-dim">
              {stream.tokenSymbol ?? "Milestone stream"}
            </span>
            {stream.creatorDisplayName && (
              <span className="text-xs text-dim">by {stream.creatorDisplayName}</span>
            )}
          </div>
          <p className="text-sm text-text">
            {stream.recipientAddress.slice(0, 8)}... — {stream.amount} tokens
          </p>
          <p className="text-xs text-dim">
            Claimed: {formatSol(new BN(stream.amountWithdrawn ?? "0"), stream.tokenDecimals ?? 6)}
          </p>
          {stream.description && <p className="text-xs text-dim italic">{stream.description}</p>}
        </Link>
        <div className="flex shrink-0 flex-col gap-2">
          {canTrigger && (
            <Button size="sm" onClick={onTrigger} disabled={triggerPending}>
              {triggerPending ? "Completing..." : "Complete Milestone"}
            </Button>
          )}
          {role === "created" && !milestoneReached && !cancelled && (
            <Button variant="destructive" size="sm" onClick={onCancel} disabled={cancelPending}>
              {cancelPending ? "Cancelling..." : "Cancel"}
            </Button>
          )}
          {role === "received" && isRecipient && milestoneReached && (
            <Button size="sm" onClick={onClaim} disabled={withdrawPending}>
              {withdrawPending ? "Claiming..." : "Claim"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
