import { Dialog } from "@base-ui/react/dialog";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useState, useMemo } from "react";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStream } from "@/hooks/tx/use-create-stream";
import { useAuth } from "@/lib/solana/use-auth";

interface VestToMemberModalProps {
  orgId: string;
  mintAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: "1 year", seconds: 365 * 24 * 60 * 60 },
  { label: "2 years", seconds: 2 * 365 * 24 * 60 * 60 },
  { label: "3 years", seconds: 3 * 365 * 24 * 60 * 60 },
  { label: "4 years", seconds: 4 * 365 * 24 * 60 * 60 },
];

const CLIFF_OPTIONS = [
  { label: "No cliff", seconds: 0 },
  { label: "3 months", seconds: 90 * 24 * 60 * 60 },
  { label: "6 months", seconds: 180 * 24 * 60 * 60 },
  { label: "1 year", seconds: 365 * 24 * 60 * 60 },
];

function isValidPubkey(addr: string): boolean {
  try {
    void new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

export function VestToMemberModal({
  orgId,
  mintAddress,
  tokenSymbol,
  tokenDecimals,
  onClose,
}: VestToMemberModalProps) {
  const { publicKey } = useAuth();
  const createStream = useCreateStream();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [durationIdx, setDurationIdx] = useState(3); // default 4 years
  const [cliffIdx, setCliffIdx] = useState(0); // default no cliff

  const errors = useMemo(() => {
    const e: string[] = [];
    if (recipient && !isValidPubkey(recipient)) e.push("Invalid recipient address");
    if (amount && Number(amount) <= 0) e.push("Amount must be greater than 0");
    return e;
  }, [recipient, amount]);

  const canSubmit =
    publicKey &&
    recipient &&
    amount &&
    Number(amount) > 0 &&
    errors.length === 0 &&
    !createStream.isPending;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!publicKey || !canSubmit) return;

    const mint = new PublicKey(mintAddress);
    const now = Math.floor(Date.now() / 1000) + 120; // 2min buffer for tx confirmation
    const duration = DURATION_OPTIONS[durationIdx].seconds;
    const cliff = CLIFF_OPTIONS[cliffIdx].seconds;

    createStream.mutate({
      recipient: new PublicKey(recipient),
      mint,
      amount: Math.round(Number(amount) * 10 ** tokenDecimals),
      startTime: now,
      endTime: now + duration,
      cliffTime: cliff > 0 ? now + cliff : now,
      senderToken: getAssociatedTokenAddressSync(mint, publicKey, true),
      orgId,
    });
  };

  function handleClose() {
    if (createStream.isSuccess) {
      createStream.reset();
    }
    onClose();
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg1 p-0 shadow-xl">
          <Dialog.Title className="sr-only">Vest {tokenSymbol} to Member</Dialog.Title>
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-text">Vest {tokenSymbol} to Member</h2>
              <Dialog.Close
                className="rounded-lg p-1 text-muted transition-colors hover:bg-bg2"
                aria-label="Close"
              >
                <LuX className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {createStream.isSuccess ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm font-semibold text-text">Vest Created Successfully</p>
                <a
                  href={`https://explorer.solana.com/tx/${createStream.data.tx}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-primary hover:underline font-mono"
                >
                  {createStream.data.tx.slice(0, 16)}...
                </a>
                <Button className="mt-4" onClick={handleClose}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Recipient Wallet</label>
                  <Input
                    placeholder="Enter wallet address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Amount ({tokenSymbol})</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Duration</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border2 bg-bg2 px-3.5 text-sm"
                    value={durationIdx}
                    onChange={(e) => setDurationIdx(Number(e.target.value))}
                  >
                    {DURATION_OPTIONS.map((opt, i) => (
                      <option key={opt.label} value={i}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Cliff</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border2 bg-bg2 px-3.5 text-sm"
                    value={cliffIdx}
                    onChange={(e) => setCliffIdx(Number(e.target.value))}
                  >
                    {CLIFF_OPTIONS.map((opt, i) => (
                      <option key={opt.label} value={i}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {errors.length > 0 && (
                  <div className="rounded-md border border-warn/30 bg-warn/5 px-4 py-3">
                    <ul className="list-inside list-disc space-y-1 text-sm text-warn">
                      {errors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {createStream.isError && (
                  <div className="rounded-md border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
                    {createStream.error instanceof Error
                      ? createStream.error.message
                      : "Transaction failed"}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    {createStream.isPending ? "Confirming..." : "Create Vest"}
                  </Button>
                </div>

                {createStream.isPending && (
                  <p className="text-center text-xs text-muted">Waiting for wallet approval...</p>
                )}
              </form>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
