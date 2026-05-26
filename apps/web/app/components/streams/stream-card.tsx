import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import {
  getVaultPda,
  getClaimable,
  getStatus,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import type { StreamAccount } from "@solana-tdp/sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddress, formatSol, formatDate, formatDuration } from "@/utils/format";

const CLOCK_RPC = "recent";

export function StreamCard({
  stream,
  pda,
  onCancel,
}: {
  stream: StreamAccount;
  pda: PublicKey;
  onCancel: (stream: StreamAccount, pda: PublicKey) => void;
}) {
  const { publicKey } = useWallet();
  const isSender = publicKey?.equals(stream.sender);
  const isRecipient = publicKey?.equals(stream.recipient);
  const counterparty = isSender ? stream.recipient : stream.sender;

  const vaultPda = useMemo(
    () => getVaultPda(pda, PROGRAM_ID)[0],
    [pda],
  );

  const clockTime = Math.floor(Date.now() / 1000);
  const status = getStatus(stream);
  const claimable = getClaimable(stream, clockTime);

  const totalSec = stream.endTime.sub(stream.startTime).toNumber();
  const elapsedSec = Math.max(0, clockTime - stream.startTime.toNumber());
  const remainingSec = Math.max(0, totalSec - elapsedSec);
  const progress = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;

  const statusColor =
    status === "cancelled" ? "warn" as const
    : status === "completed" ? "sol2" as const
    : "sol" as const;

  return (
    <div className="rounded-xl border border-border bg-bg1 px-5 py-4 transition-colors hover:border-border2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={statusColor}>{status}</Badge>
            <span className="font-mono text-xs text-dim">
              {formatAddress(pda)}
            </span>
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

          <div className="pt-1">
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border2">
                <div
                  className="h-full rounded-full bg-sol transition-all"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-dim">{Math.round(progress)}%</span>
            </div>
            <div className="mt-1 flex justify-between font-mono text-xs text-dim">
              <span>{formatDate(stream.startTime)}</span>
              <span>{formatDate(stream.endTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {isSender && status === "active" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(stream, pda)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
