import { Button } from "@simplyvest/ui/button";
import { PublicKey } from "@solana/web3.js";

import { useTriggerMilestone } from "@/hooks/tx/use-trigger-milestone";
import type { StreamDetail } from "@/hooks/use-stream-detail";

export function TriggerMilestoneButton({ detail }: { detail: StreamDetail }) {
  const triggerMilestone = useTriggerMilestone();

  if (detail.streamType !== "milestone") return null;
  if (detail.milestoneReached) return null;
  if (detail.status !== "active") return null;

  const pda = new PublicKey(detail.pda);

  return (
    <Button onClick={() => triggerMilestone.mutate(pda)} disabled={triggerMilestone.isPending}>
      {triggerMilestone.isPending ? "Triggering..." : "Mark Milestone Reached"}
    </Button>
  );
}
