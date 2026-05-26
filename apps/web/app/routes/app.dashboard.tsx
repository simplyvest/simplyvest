import { createRoute } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";

import { Route as AppRoute } from "./app";
import { StreamList } from "@/components/streams/stream-list";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/dashboard",
  component: DashboardPage,
});

function DashboardPage() {
  const { connected } = useWallet();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          {connected
            ? "View and manage your vesting streams"
            : "Connect your wallet to view streams"}
        </p>
      </div>
      <StreamList />
    </div>
  );
}
