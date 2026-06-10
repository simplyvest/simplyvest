import { Dialog } from "@base-ui/react/dialog";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatSol } from "@/utils/format";

type FundWalletModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  currentBalance: number; // lamports
  onFunded: () => void;
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function FundWalletModal({
  open,
  onOpenChange,
  walletAddress,
  currentBalance,
  onFunded,
}: FundWalletModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    copyToClipboard(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg1 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-text">Not Enough SOL</Dialog.Title>

          <p className="mt-3 text-sm text-muted">
            Your wallet needs at least <span className="font-medium text-text">0.011 SOL</span> to
            cover the token creation cost.
          </p>

          <div className="mt-4 rounded-lg border border-border bg-bg2 p-3">
            <p className="text-xs text-muted">Current balance</p>
            <p className="text-lg font-semibold text-warn">{formatSol(currentBalance)} SOL</p>
          </div>

          <p className="mt-4 text-xs font-medium text-text">Your wallet address</p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border bg-bg2 px-3 py-2 text-xs text-text">
              {walletAddress}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted">
            Send at least 0.011 SOL to this address, then come back and click below.
          </p>

          <Button variant="default" className="mt-4 w-full" onClick={onFunded}>
            I've Funded My Wallet
          </Button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
