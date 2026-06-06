import { getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useAuth } from "@/lib/solana/use-auth";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import { useStreams, useMilestoneStreams } from "@/hooks/use-stream";
import {
  useTriggerMilestone,
  useWithdrawMilestone,
  useCancelMilestone,
} from "@/hooks/use-transactions";

import { CancelDialog } from "../cancel-dialog";
import { StreamCard } from "../stream-card/stream-card";
import { MilestoneStreamCard } from "./milestone-stream-card";

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
  const { publicKey } = useAuth();
  const [selected, setSelected] = useState<SelectedStream | null>(null);
  const triggerMilestone = useTriggerMilestone();
  const withdrawMilestone = useWithdrawMilestone();
  const cancelMilestone = useCancelMilestone();

  const { data: streams, isLoading: streamsLoading } = useStreams();
  const { data: milestoneStreams, isLoading: milestoneLoading } = useMilestoneStreams();

  const isLoading = streamsLoading || milestoneLoading;

  const createdStreams = (streams ?? []).filter((s: StreamItem) =>
    publicKey?.equals(s.account.creator),
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
          const isRecipient = publicKey?.equals(s.account.recipient);
          return (
            <MilestoneStreamCard
              key={s.publicKey.toBase58()}
              item={s}
              role={role}
              isRecipient={isRecipient ?? false}
              canTrigger={canTrigger}
              onTrigger={() => triggerMilestone.mutate(s.publicKey)}
              onCancel={() => {
                if (window.confirm("Cancel this milestone stream?")) {
                  const senderToken = getAssociatedTokenAddressSync(
                    s.account.mint,
                    s.account.creator,
                  );
                  const [vaultPda] = getVaultPda(s.publicKey, PROGRAM_ID);
                  cancelMilestone.mutate({
                    stream: s.publicKey,
                    vault: vaultPda,
                    senderToken,
                    mint: s.account.mint,
                  });
                }
              }}
              onClaim={() => {
                const [vaultPda] = getVaultPda(s.publicKey, PROGRAM_ID);
                const recipientToken = getAssociatedTokenAddressSync(
                  s.account.mint,
                  s.account.recipient,
                );
                withdrawMilestone.mutate({
                  stream: s.publicKey,
                  vault: vaultPda,
                  sender: s.account.creator,
                  mint: s.account.mint,
                  recipientToken,
                });
              }}
              triggerPending={triggerMilestone.isPending}
              cancelPending={cancelMilestone.isPending}
              withdrawPending={withdrawMilestone.isPending}
            />
          );
        })}
      </div>
    </>
  );
}
