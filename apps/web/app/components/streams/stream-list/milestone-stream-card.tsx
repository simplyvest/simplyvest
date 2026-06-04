import type { MilestoneStreamAccount } from "@solana-tdp/sdk";
import { formatAddress } from "@solana-tdp/sdk";
import type { PublicKey } from "@solana/web3.js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSol } from "@/utils/format";

interface MilestoneStreamItem {
  publicKey: PublicKey;
  account: MilestoneStreamAccount;
}

export function MilestoneStreamCard({
  item,
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
  item: MilestoneStreamItem;
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
  return (
    <div className="rounded-xl border border-border bg-bg1 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={item.account.milestoneReached ? "sol2" : "sol"}>
              {item.account.milestoneReached ? "completed" : "active"}
            </Badge>
            <span className="font-mono text-xs text-dim">Milestone stream</span>
          </div>
          <p className="text-sm text-text">
            {formatAddress(item.account.recipient)} — {item.account.amount.toString()} tokens
          </p>
          <p className="text-xs text-dim">Claimed: {formatSol(item.account.amountWithdrawn, 6)}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {canTrigger && (
            <Button size="sm" onClick={onTrigger} disabled={triggerPending}>
              {triggerPending ? "Completing..." : "Complete Milestone"}
            </Button>
          )}
          {role === "created" && !item.account.milestoneReached && !item.account.cancelled && (
            <Button variant="destructive" size="sm" onClick={onCancel} disabled={cancelPending}>
              {cancelPending ? "Cancelling..." : "Cancel"}
            </Button>
          )}
          {role === "received" && isRecipient && item.account.milestoneReached && (
            <Button size="sm" onClick={onClaim} disabled={withdrawPending}>
              {withdrawPending ? "Claiming..." : "Claim"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
