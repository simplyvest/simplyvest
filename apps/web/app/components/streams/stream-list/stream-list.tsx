import { getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import { useTriggerMilestone } from "@/hooks/tx/use-trigger-milestone";
import { useWithdrawMilestone } from "@/hooks/tx/use-withdraw-milestone";
import { useApiStreams, type StreamWithEvents } from "@/hooks/use-api";
import { useAuth } from "@/lib/solana/use-auth";

import { CancelDialog } from "../cancel-dialog";
import { CancelMilestoneDialog } from "../cancel-milestone-dialog";
import { StreamCard } from "../stream-card/stream-card";
import { MilestoneStreamCard } from "./milestone-stream-card";

interface SelectedStream {
  stream: StreamWithEvents;
  pda: string;
}

interface SelectedMilestoneStream {
  stream: StreamWithEvents;
  pda: string;
}

export function StreamList({ role }: { role: "created" | "received" }) {
  const { publicKey } = useAuth();
  const [selected, setSelected] = useState<SelectedStream | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<SelectedMilestoneStream | null>(null);
  const triggerMilestone = useTriggerMilestone();
  const withdrawMilestone = useWithdrawMilestone();

  const walletAddress = publicKey?.toBase58();
  const { data: streams, isLoading } = useApiStreams({
    creator: role === "created" ? walletAddress : undefined,
    recipient: role === "received" ? walletAddress : undefined,
  });

  const timeStreams = (streams ?? []).filter((s) => s.type === "time");
  const milestoneStreams = (streams ?? []).filter((s) => s.type === "milestone");

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

  if (timeStreams.length === 0 && milestoneStreams.length === 0) {
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
          pda={new PublicKey(selected.pda)}
          onClose={() => setSelected(null)}
        />
      )}

      {selectedMilestone && (
        <CancelMilestoneDialog
          stream={selectedMilestone.stream}
          pda={new PublicKey(selectedMilestone.pda)}
          onClose={() => setSelectedMilestone(null)}
        />
      )}

      <div className="space-y-3">
        {timeStreams.map((s) => (
          <StreamCard
            key={s.id}
            stream={s}
            role={role}
            onCancel={(stream, pda) => setSelected({ stream, pda })}
          />
        ))}

        {milestoneStreams.map((s) => {
          const canTrigger = role === "created" && !s.milestoneReached;
          const isRecipient = walletAddress === s.recipientAddress;
          return (
            <MilestoneStreamCard
              key={s.id}
              stream={s}
              role={role}
              isRecipient={isRecipient}
              canTrigger={canTrigger}
              onTrigger={() => {
                const pda = new PublicKey(s.id);
                triggerMilestone.mutate(pda);
              }}
              onCancel={() => setSelectedMilestone({ stream: s, pda: s.id })}
              onClaim={() => {
                const pda = new PublicKey(s.id);
                const mintPk = new PublicKey(s.mintAddress);
                const creatorPk = new PublicKey(s.creatorAddress);
                const [vaultPda] = getVaultPda(pda, PROGRAM_ID);
                const recipientToken = publicKey
                  ? getAssociatedTokenAddressSync(mintPk, publicKey)
                  : pda;
                withdrawMilestone.mutate({
                  stream: pda,
                  vault: vaultPda,
                  sender: creatorPk,
                  mint: mintPk,
                  recipientToken,
                });
              }}
              triggerPending={triggerMilestone.isPending}
              cancelPending={false}
              withdrawPending={withdrawMilestone.isPending}
            />
          );
        })}
      </div>
    </>
  );
}
