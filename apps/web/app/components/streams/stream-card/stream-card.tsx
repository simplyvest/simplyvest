import { getClaimable, getStatus, getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import type { StreamAccount } from "@solana-tdp/sdk";
import { formatAddress } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useAuth } from "@/lib/solana/use-auth";
import { PublicKey } from "@solana/web3.js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWithdraw } from "@/hooks/tx/use-withdraw";
import { formatSol, formatDuration } from "@/utils/format";

import { StreamProgressBar } from "./stream-progress-bar";

export function StreamCard({
  stream,
  pda,
  onCancel,
  role,
}: {
  stream: StreamAccount;
  pda: PublicKey;
  onCancel: (stream: StreamAccount, pda: PublicKey) => void;
  role?: "created" | "received";
}) {
  const { publicKey } = useAuth();
  const withdraw = useWithdraw();
  const isSender = publicKey?.equals(stream.creator);
  const isRecipient = publicKey?.equals(stream.recipient);
  const counterparty = isSender ? stream.recipient : stream.creator;

  const clockTime = Math.floor(Date.now() / 1000);
  const status = getStatus(stream);
  const claimable = getClaimable(stream, clockTime);

  const [vaultPda] = getVaultPda(pda, PROGRAM_ID);
  const recipientToken = publicKey ? getAssociatedTokenAddressSync(stream.mint, publicKey) : pda;

  const totalSec = stream.endTime.sub(stream.startTime).toNumber();
  const elapsedSec = Math.max(0, clockTime - stream.startTime.toNumber());
  const remainingSec = Math.max(0, totalSec - elapsedSec);
  const progress = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;

  const statusColor =
    status === "cancelled"
      ? ("warn" as const)
      : status === "completed"
        ? ("sol2" as const)
        : ("sol" as const);

  return (
    <div className="rounded-xl border border-border bg-bg1 px-5 py-4 transition-colors hover:border-border2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={statusColor}>{status}</Badge>
            <span className="font-mono text-xs text-dim">{formatAddress(pda)}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div>
              <span className="text-dim">Token</span>
              <p className="font-mono text-text">{formatAddress(stream.mint)}</p>
            </div>
            <div>
              <span className="text-dim">{isSender ? "Recipient" : "Sender"}</span>
              <p className="font-mono text-text">
                {isSender && "→ "}
                {isRecipient && "← "}
                {formatAddress(counterparty)}
              </p>
            </div>
            <div>
              <span className="text-dim">Total</span>
              <p className="text-text">{formatSol(stream.amount, 6)}</p>
            </div>
            <div>
              <span className="text-dim">Claimable</span>
              <p className="text-text">{formatSol(claimable, 6)}</p>
            </div>
            <div>
              <span className="text-dim">Withdrawn</span>
              <p className="text-text">{formatSol(stream.amountWithdrawn, 6)}</p>
            </div>
            <div>
              <span className="text-dim">Remaining</span>
              <p className="text-text">
                {status === "active" ? formatDuration(remainingSec) : "—"}
              </p>
            </div>
          </div>

          <StreamProgressBar
            progress={progress}
            startTime={stream.startTime}
            endTime={stream.endTime}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {role !== "received" &&
            isSender &&
            status === "active" &&
            clockTime < stream.endTime.toNumber() && (
              <Button variant="destructive" size="sm" onClick={() => onCancel(stream, pda)}>
                Cancel
              </Button>
            )}
          {role === "received" &&
            isRecipient &&
            status === "active" &&
            claimable.toNumber() > 0 && (
              <Button
                size="sm"
                onClick={() =>
                  withdraw.mutate({
                    stream: pda,
                    vault: vaultPda,
                    sender: stream.creator,
                    mint: stream.mint,
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
