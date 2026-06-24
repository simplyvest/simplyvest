import { Button } from "@simplyvest/ui/button";
import { getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Link } from "@tanstack/react-router";
import BN from "bn.js";

import { Badge } from "@/components/ui/badge";
import { useWithdraw } from "@/hooks/tx/use-withdraw";
import type { StreamWithEvents } from "@/hooks/use-stream-api";
import { useAuth } from "@/lib/solana/use-auth";
import { formatSol, formatDuration } from "@/utils/format";
import { calcClaimable, calcProgress, getStreamStatusColor } from "@/utils/stream";

import { StreamProgressBar } from "./stream-progress-bar";

export function StreamCard({
  stream,
  onCancel,
  role,
}: {
  stream: StreamWithEvents;
  onCancel: (stream: StreamWithEvents, pda: string) => void;
  role?: "created" | "received";
}) {
  const { publicKey } = useAuth();
  const withdraw = useWithdraw();

  const pda = new PublicKey(stream.id);
  const creatorPk = new PublicKey(stream.creatorAddress);
  const recipientPk = new PublicKey(stream.recipientAddress);
  const mintPk = new PublicKey(stream.mintAddress);

  const isSender = publicKey?.equals(creatorPk);
  const isRecipient = publicKey?.equals(recipientPk);
  const counterparty = isSender ? recipientPk : creatorPk;

  const clockTime = Math.floor(Date.now() / 1000);
  const startTime = stream.startTime ?? 0;
  const endTime = stream.endTime ?? 0;
  const amount = new BN(stream.amount);
  const amountWithdrawn = new BN(stream.amountWithdrawn ?? "0");

  const status = stream.status;

  const claimable = calcClaimable(amount, amountWithdrawn, startTime, endTime, clockTime, status);

  const [vaultPda] = getVaultPda(pda, PROGRAM_ID);
  const recipientToken = publicKey ? getAssociatedTokenAddressSync(mintPk, publicKey) : pda;

  const remainingSec = Math.max(0, endTime - startTime - Math.max(0, clockTime - startTime));
  const progress = calcProgress(startTime, endTime, clockTime);

  const statusColor = getStreamStatusColor(status);

  return (
    <div className="rounded-xl border border-border bg-bg1 px-5 py-4 transition-colors hover:border-border2">
      <div className="flex items-start justify-between gap-4">
        <Link
          to="/app/streams/$streamPda"
          params={{ streamPda: stream.id }}
          className="min-w-0 flex-1 space-y-2 no-underline hover:no-underline"
        >
          <div className="flex items-center gap-2">
            <Badge variant={statusColor}>{status}</Badge>
            <span className="font-mono text-xs text-dim">
              {stream.tokenSymbol ?? stream.mintAddress.slice(0, 8)}
            </span>
            {stream.creatorDisplayName && (
              <span className="text-xs text-dim">by {stream.creatorDisplayName}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div>
              <span className="text-dim">Token</span>
              <p className="font-mono text-text">
                {stream.tokenName ?? stream.mintAddress.slice(0, 8) + "..."}
              </p>
            </div>
            <div>
              <span className="text-dim">{isSender ? "Recipient" : "Sender"}</span>
              <p className="font-mono text-text">
                {isSender && "→ "}
                {isRecipient && "← "}
                {counterparty.toBase58().slice(0, 8)}...
              </p>
            </div>
            <div>
              <span className="text-dim">Total</span>
              <p className="text-text">{formatSol(amount, stream.tokenDecimals ?? 6)}</p>
            </div>
            <div>
              <span className="text-dim">Claimable</span>
              <p className="text-text">{formatSol(claimable, stream.tokenDecimals ?? 6)}</p>
            </div>
            <div>
              <span className="text-dim">Withdrawn</span>
              <p className="text-text">{formatSol(amountWithdrawn, stream.tokenDecimals ?? 6)}</p>
            </div>
            <div>
              <span className="text-dim">Remaining</span>
              <p className="text-text">
                {status === "active" ? formatDuration(remainingSec) : "—"}
              </p>
            </div>
          </div>

          {stream.description && <p className="text-xs text-dim italic">{stream.description}</p>}

          <StreamProgressBar
            progress={progress}
            startTime={new BN(startTime)}
            endTime={new BN(endTime)}
          />
        </Link>

        <div className="flex shrink-0 flex-col gap-2">
          {role !== "received" && isSender && status === "active" && clockTime < endTime && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(stream, stream.id)}>
              Cancel
            </Button>
          )}
          {role === "received" && isRecipient && status === "active" && claimable.gt(new BN(0)) && (
            <Button
              size="sm"
              onClick={() =>
                withdraw.mutate({
                  stream: pda,
                  vault: vaultPda,
                  sender: creatorPk,
                  mint: mintPk,
                  recipientToken,
                  amount: claimable.toNumber(),
                })
              }
              disabled={withdraw.isPending}
            >
              {withdraw.isPending ? "Claiming..." : "Claim"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
