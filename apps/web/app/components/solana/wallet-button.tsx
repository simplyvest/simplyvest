import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import * as React from "react";

import { Button } from "@/components/ui/button";

function DisconnectDialog({
  address,
  onConfirm,
  onDismiss,
}: {
  address: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const full = address;
  const short = `${full.slice(0, 4)}...${full.slice(-4)}`;
  const [dontAsk, setDontAsk] = React.useState(false);

  const handleConfirm = () => {
    if (dontAsk) {
      try {
        localStorage.setItem("sv_skip_disconnect_warn", "1");
      } catch {}
    }
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-purple-100 bg-white p-6 shadow-xl dark:border-purple-900/50 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-text">Disconnect wallet</h3>
        <p className="mt-2 text-sm text-muted">
          You are connected as <span className="font-mono font-medium text-text">{short}</span>
        </p>
        <div className="mt-3 rounded-lg bg-bg2 p-3 break-all font-mono text-xs text-text">
          {full}
        </div>
        <label className="mt-4 flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dontAsk}
            onChange={(e) => setDontAsk(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-sol accent-purple-600"
          />
          <span className="text-xs text-muted leading-relaxed">Don&apos;t show this again</span>
        </label>
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25 hover:brightness-110 transition-all"
          >
            Disconnect
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function WalletButton() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { publicKey, connected, connecting } = wallet;
  const [showDialog, setShowDialog] = React.useState(false);

  if (connected && publicKey) {
    const full = publicKey.toBase58();
    const short = `${full.slice(0, 4)}...${full.slice(-4)}`;

    const handleClick = () => {
      const skip = (() => {
        try {
          return localStorage.getItem("sv_skip_disconnect_warn");
        } catch {
          return null;
        }
      })();
      if (skip === "1") {
        void wallet.disconnect();
      } else {
        setShowDialog(true);
      }
    };

    return (
      <>
        <Button variant="outline-brand" size="sm" onClick={handleClick}>
          {short}
        </Button>
        {showDialog && (
          <DisconnectDialog
            address={full}
            onConfirm={() => {
              setShowDialog(false);
              void wallet.disconnect();
            }}
            onDismiss={() => setShowDialog(false)}
          />
        )}
      </>
    );
  }

  return (
    <Button variant="brand" size="sm" onClick={() => setVisible(true)} disabled={connecting}>
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
