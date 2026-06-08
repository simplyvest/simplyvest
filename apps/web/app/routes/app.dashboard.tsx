import { createRoute } from "@tanstack/react-router";
import { Link, useSearch } from "@tanstack/react-router";

import { StreamList } from "@/components/streams/stream-list/stream-list";
import { useAuth } from "@/lib/solana/use-auth";
import { cn } from "@/utils/cn";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/dashboard",
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : "created",
  }),
});

const tabs = [
  { key: "created", label: "Created" },
  { key: "received", label: "Received" },
] as const;

function DashboardPage() {
  const { connected } = useAuth();
  const { tab } = useSearch({ from: Route.id });

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

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-bg1 p-0.5">
        {tabs.map((t) => (
          <Link
            key={t.key}
            to="/app/dashboard"
            search={{ tab: t.key }}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-all no-underline hover:no-underline",
              tab === t.key ? "bg-sol text-white shadow-sm" : "text-muted hover:text-text",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <StreamList role={tab === "created" ? "created" : "received"} />
    </div>
  );
}
