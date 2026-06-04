import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Outlet, createRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "@/components/ui/button";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/app",
  component: AppLayout,
});

function AppLayout() {
  const { publicKey, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const navigate = useNavigate();
  const location = useRouterState().location;

  const showContent = publicKey && !connecting;

  // Redirect /app to /app/dashboard when wallet is connected
  React.useEffect(() => {
    if (showContent && location.pathname === "/app") {
      void navigate({ to: "/app/dashboard", search: { tab: "created" }, replace: true });
    }
  }, [showContent, location.pathname, navigate]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-4">
      {showContent ? (
        <div className="pb-12">
          <Outlet />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-16">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="rounded-2xl border border-sol/20 bg-sol/5 p-6">
              <svg
                className="h-12 w-12 text-sol"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text">Connect Your Wallet</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                To use the SimplyVest app, connect your Phantom or Solflare wallet and make sure
                you're on <span className="font-mono text-sol">Solana devnet</span>.
              </p>
            </div>
            <Button
              variant="default"
              size="lg"
              className="min-w-[200px]"
              onClick={() => setVisible(true)}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
