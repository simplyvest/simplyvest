import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Outlet, createRoute, Link, useRouterState } from "@tanstack/react-router";

import { WalletButton } from "@/components/solana/wallet-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/app",
  component: AppLayout,
});

const tabs = [
  { path: "/app/dashboard", label: "Dashboard" },
  { path: "/app/create", label: "Create Stream" },
];

function AppHeader() {
  const routerState = useRouterState();
  const location = routerState.location;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline hover:no-underline">
          <div className="flex items-center gap-2.5 rounded-md bg-sol p-1.5 dark:bg-transparent">
            <img src="/simplyvest.png" alt="SimplyVest" className="h-7 w-auto" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-text">SimplyVest</span>
        </Link>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "rounded px-3 py-1.5 font-mono text-[0.67rem] tracking-wide transition-colors hover:bg-bg2 hover:text-text hover:no-underline focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none",
                  isActive ? "text-text" : "text-muted",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
          <WalletButton />
        </nav>
      </div>
    </header>
  );
}

function AppLayout() {
  const { connected, publicKey, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const showContent = connected && !!publicKey;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-20">
      <AppHeader />

      {showContent ? (
        <div className="pb-12">
          <Outlet />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-32">
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
