import { useWallet } from "@solana/wallet-adapter-react";
import { createRoute } from "@tanstack/react-router";

import { CreateStreamForm } from "@/components/streams/create-stream-form";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/create",
  component: CreatePage,
});

function CreatePage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-bg1">
        <p className="text-sm text-muted">Connect your wallet to create a stream</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Create Stream</h1>
        <p className="mt-1 text-sm text-muted">Lock tokens in a vesting stream for a recipient</p>
      </div>
      <div>
        <CreateStreamForm />
      </div>
    </div>
  );
}
