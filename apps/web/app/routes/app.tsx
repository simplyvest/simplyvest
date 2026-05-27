import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Outlet, createRoute, Link, useRouterState } from "@tanstack/react-router";

import { WalletButton } from "@/components/solana/wallet-button";
import { Button } from "@/components/ui/button";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/app",
  component: AppLayout,
});

function AppNav() {
  const routerState = useRouterState();
  const location = routerState.location;

  const tabs = [
    { path: "/app/dashboard", label: "Dashboard" },
    { path: "/app/create", label: "Create Stream" },
  ];

  return (
    <nav className="mb-8 flex items-center justify-between border-b border-border pb-4">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight no-underline hover:no-underline"
        >
          <img src="/simplyvest.png" alt="SimplyVest" className="h-6 w-auto" />
          SimplyVest
        </Link>
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors hover:no-underline ${
                  isActive ? "bg-sol/15 text-sol" : "text-muted hover:text-text"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <WalletButton />
    </nav>
  );
}

function AppLayout() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-6">
      <AppNav />

      {connected && publicKey ? (
        <div className="pb-12">
          <Outlet />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-24">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-sol/10 p-4">
              <svg
                className="h-8 w-8 text-sol"
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
              <h2 className="text-xl font-bold text-text">Connect Your Wallet</h2>
              <p className="mt-2 text-sm text-muted max-w-sm">
                To use the SimplyVest app, connect your Phantom or Solflare wallet. Make sure you're
                on Solana devnet.
              </p>
            </div>
            <Button variant="default" size="lg" onClick={() => setVisible(true)}>
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
