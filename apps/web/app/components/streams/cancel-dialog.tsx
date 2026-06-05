import { getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import type { StreamAccount } from "@solana-tdp/sdk";
import { formatAddress } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { useCancel } from "@/hooks/use-transactions";
import { formatSol } from "@/utils/format";

export function CancelDialog({
  stream,
  pda,
  onClose,
}: {
  stream: StreamAccount;
  pda: PublicKey;
  onClose: () => void;
}) {
  const cancel = useCancel();
  const { publicKey } = useWallet();

  const vaultPda = useMemo(() => getVaultPda(pda, PROGRAM_ID)[0], [pda]);

  const senderAta = useMemo(
    () => (publicKey ? getAssociatedTokenAddressSync(stream.mint, stream.creator, true) : null),
    [stream.mint, stream.creator, publicKey],
  );

  const recipientAta = useMemo(
    () => getAssociatedTokenAddressSync(stream.mint, stream.recipient, true),
    [stream.mint, stream.recipient],
  );

  const handleConfirm = async () => {
    if (!senderAta) return;
    cancel.mutate(
      {
        recipient: stream.recipient,
        stream: pda,
        vault: vaultPda,
        senderToken: senderAta,
        recipientToken: recipientAta,
        mint: stream.mint,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-text">Cancel Stream</h3>
      <p className="mt-1 text-sm text-muted">
        This will send the vested tokens to the recipient and return the unvested portion to you.
        The stream will be closed permanently.
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
          <span className="text-dim">Withdrawn</span>
          <span className="text-text">{formatSol(stream.amountWithdrawn, 6)}</span>
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
