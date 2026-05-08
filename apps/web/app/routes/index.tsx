import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { WalletButton } from "@/components/solana/wallet-button";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">
          Solana Token Distribution Protocol
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Distribute SPL tokens on Solana with programmable vesting schedules.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="text-xl font-semibold text-card-foreground">
          Get Started
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your wallet to start managing token distributions.
        </p>
        <div className="mt-6">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
