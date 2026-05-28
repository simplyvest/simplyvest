import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStreams, useMilestoneStreams } from "@/hooks/use-stream";
import { useTriggerMilestone } from "@/hooks/use-transactions";
import { formatAddress } from "@/utils/format";

import { CancelDialog } from "./cancel-dialog";
import { StreamCard } from "./stream-card";

interface StreamItem {
  publicKey: PublicKey;
  account: StreamAccount;
}

interface MilestoneStreamItem {
  publicKey: PublicKey;
  account: MilestoneStreamAccount;
}

interface SelectedStream {
  stream: StreamAccount;
  pda: PublicKey;
}

export function StreamList({ role }: { role: "created" | "received" }) {
  const { publicKey } = useWallet();
  const [selected, setSelected] = useState<SelectedStream | null>(null);
  const triggerMilestone = useTriggerMilestone();

  const { data: streams, isLoading: streamsLoading } = useStreams();
  const { data: milestoneStreams, isLoading: milestoneLoading } = useMilestoneStreams();

  const isLoading = streamsLoading || milestoneLoading;

  const createdStreams = (streams ?? []).filter((s: StreamItem) =>
    publicKey?.equals(s.account.sender),
  );
  const receivedStreams = (streams ?? []).filter((s: StreamItem) =>
    publicKey?.equals(s.account.recipient),
  );

  const createdMilestoneStreams = (milestoneStreams ?? []).filter((s: MilestoneStreamItem) =>
    publicKey?.equals(s.account.creator),
  );
  const receivedMilestoneStreams = (milestoneStreams ?? []).filter((s: MilestoneStreamItem) =>
    publicKey?.equals(s.account.recipient),
  );

  const relevantStreams = role === "created" ? createdStreams : receivedStreams;
  const relevantMilestoneStreams =
    role === "created" ? createdMilestoneStreams : receivedMilestoneStreams;

  if (!publicKey) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-bg1">
        <p className="text-sm text-muted">Connect your wallet to see streams</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-bg1" />
        ))}
      </div>
    );
  }

  if (relevantStreams.length === 0 && relevantMilestoneStreams.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-bg1">
        <div className="text-center">
          <p className="text-sm text-muted">
            {role === "created" ? "No streams created yet" : "No streams received yet"}
          </p>
          <p className="mt-1 text-xs text-dim">Create a stream to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {selected && (
        <CancelDialog
          stream={selected.stream}
          pda={selected.pda}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="space-y-3">
        {relevantStreams.map((s) => (
          <StreamCard
            key={s.publicKey.toBase58()}
            stream={s.account}
            pda={s.publicKey}
            role={role}
            onCancel={(stream, pda) => setSelected({ stream, pda })}
          />
        ))}

        {relevantMilestoneStreams.map((s) => {
          const canTrigger = role === "created" && !s.account.milestoneReached;
          return (
            <div
              key={s.publicKey.toBase58()}
              className="rounded-xl border border-border bg-bg1 px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={s.account.milestoneReached ? "sol2" : "sol"}>
                      {s.account.milestoneReached ? "completed" : "active"}
                    </Badge>
                    <span className="font-mono text-xs text-dim">Milestone stream</span>
                  </div>
                  <p className="text-sm text-text">
                    {formatAddress(s.account.recipient)} — {s.account.amount.toString()} tokens
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {canTrigger && (
                    <Button
                      size="sm"
                      onClick={() => triggerMilestone.mutate(s.publicKey)}
                      disabled={triggerMilestone.isPending}
                    >
                      {triggerMilestone.isPending ? "Completing..." : "Complete Milestone"}
                    </Button>
                  )}
                  {s.account.milestoneReached && (
                    <span className="text-xs text-dim">Milestone reached</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
