import { getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import type { MilestoneStreamAccount } from "@solana-tdp/sdk";
import { formatAddress } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { useCancelMilestone } from "@/hooks/tx/use-cancel-milestone";
import { formatSol } from "@/utils/format";

export function CancelMilestoneDialog({
  stream,
  pda,
  onClose,
}: {
  stream: MilestoneStreamAccount;
  pda: PublicKey;
  onClose: () => void;
}) {
  const cancel = useCancelMilestone();

  const vaultPda = useMemo(() => getVaultPda(pda, PROGRAM_ID)[0], [pda]);

  const senderToken = useMemo(
    () => getAssociatedTokenAddressSync(stream.mint, stream.creator, true),
    [stream.mint, stream.creator],
  );

  const handleConfirm = () => {
    cancel.mutate(
      {
        stream: pda,
        vault: vaultPda,
        senderToken,
        mint: stream.mint,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-text">Cancel Milestone Stream</h3>
      <p className="mt-1 text-sm text-muted">
        This will cancel the milestone stream and return the remaining tokens to the creator.
      </p>

      <div className="mt-4 space-y-2 rounded-lg bg-bg2 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-dim">Stream</span>
          <span className="font-mono text-text">{formatAddress(pda)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dim">Recipient</span>
          <span className="font-mono text-text">{formatAddress(stream.recipient)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dim">Total Amount</span>
          <span className="text-text">{formatSol(stream.amount, 6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dim">Milestone Status</span>
          <span className="text-text">{stream.milestoneReached ? "Reached" : "Not reached"}</span>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={cancel.isPending}>
          Keep Stream
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleConfirm}
          disabled={cancel.isPending}
        >
          {cancel.isPending ? "Cancelling..." : "Confirm Cancel"}
        </Button>
      </div>

      {cancel.isPending && (
        <p className="mt-2 text-center text-xs text-muted">
          Waiting for wallet approval and confirmation...
        </p>
      )}

      {cancel.isError && (
        <p className="mt-2 text-center text-xs text-warn">
          {cancel.error instanceof Error ? cancel.error.message : "Transaction failed"}
        </p>
      )}
    </ModalOverlay>
  );
}
