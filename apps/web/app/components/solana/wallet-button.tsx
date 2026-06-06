import { useLogin, useLogout } from "@privy-io/react-auth";
import * as React from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/lib/solana/use-auth";
import { Button } from "@/components/ui/button";

function LogoutDialog({
  identity,
  onConfirm,
  onDismiss,
}: {
  identity: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const [dontAsk, setDontAsk] = React.useState(false);

  const handleConfirm = () => {
    if (dontAsk) {
      try {
        localStorage.setItem("sv_skip_logout_warn", "1");
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
        className="mx-4 w-[480px] max-w-full rounded-2xl border border-purple-100 bg-white p-6 shadow-xl dark:border-purple-900/50 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-text">Log out</h3>
        <p className="mt-2 text-sm text-muted">
          You are logged in as <span className="font-medium text-text">{identity}</span>
        </p>
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
            Log out
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

export function AuthButton() {
  const { publicKey, connected, connecting, user } = useAuth();
  const { login } = useLogin();
  const { logout } = useLogout();
  const [showDialog, setShowDialog] = React.useState(false);

  if (connecting) {
    return (
      <Button variant="outline-brand" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (connected && publicKey) {
    const identity =
      user?.email ??
      user?.google ??
      (() => {
        const full = publicKey.toBase58();
        return `${full.slice(0, 4)}...${full.slice(-4)}`;
      })();

    const handleClick = () => {
      const skip = (() => {
        try {
          return localStorage.getItem("sv_skip_logout_warn");
        } catch {
          return null;
        }
      })();
      if (skip === "1") {
        void logout();
      } else {
        setShowDialog(true);
      }
    };

    return (
      <>
        <Button variant="outline-brand" size="sm" onClick={handleClick}>
          {identity}
        </Button>
        {showDialog &&
          createPortal(
            <LogoutDialog
              identity={identity}
              onConfirm={() => {
                setShowDialog(false);
                void logout();
              }}
              onDismiss={() => setShowDialog(false)}
            />,
            document.body,
          )}
      </>
    );
  }

  return (
    <Button variant="brand" size="sm" onClick={() => login({ loginMethods: ["email", "google", "wallet"] })}>
      Log In
    </Button>
  );
}
