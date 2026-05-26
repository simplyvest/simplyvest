import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useStreams, useMilestoneStreams } from "@/hooks/use-stream";
import { StreamCard } from "./stream-card";
import { CancelDialog } from "./cancel-dialog";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import type { PublicKey } from "@solana/web3.js";

interface SelectedStream {
  stream: StreamAccount;
  pda: PublicKey;
}

export function StreamList() {
  const { publicKey } = useWallet();
  const [selected, setSelected] = useState<SelectedStream | null>(null);

  const { data: streams, isLoading: streamsLoading } = useStreams();
  const { data: milestoneStreams, isLoading: milestoneLoading } = useMilestoneStreams();

  const isLoading = streamsLoading || milestoneLoading;

  const relevantStreams = (streams ?? []).filter((s) => {
    if (!publicKey) return true;
    return (
      s.account.sender.equals(publicKey) ||
      s.account.recipient.equals(publicKey)
    );
  });

  const relevantMilestoneStreams = (milestoneStreams ?? []).filter((s) => {
    if (!publicKey) return true;
    return (
      s.account.creator.equals(publicKey) ||
      s.account.recipient.equals(publicKey)
    );
  });

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
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-border bg-bg1"
          />
        ))}
      </div>
    );
  }

  if (relevantStreams.length === 0 && relevantMilestoneStreams.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-bg1">
        <div className="text-center">
          <p className="text-sm text-muted">No streams found</p>
          <p className="mt-1 text-xs text-dim">
            Create a stream to get started
          </p>
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
        {relevantStreams.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-dim uppercase tracking-wide">
              Time-based Streams
            </h3>
            <div className="space-y-3">
              {relevantStreams.map((s) => (
                <StreamCard
                  key={s.publicKey.toBase58()}
                  stream={s.account}
                  pda={s.publicKey}
                  onCancel={(stream, pda) => setSelected({ stream, pda })}
                />
              ))}
            </div>
          </div>
        )}

        {relevantMilestoneStreams.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-dim uppercase tracking-wide">
              Milestone Streams
            </h3>
            <div className="space-y-3">
              {relevantMilestoneStreams.map((s) => (
                <div
                  key={s.publicKey.toBase58()}
                  className="rounded-xl border border-border bg-bg1 px-5 py-4"
                >
                  <p className="text-sm text-muted">
                    Milestone stream — {s.account.milestoneReached ? "reached" : "pending"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
