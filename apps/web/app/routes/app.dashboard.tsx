import { createRoute } from "@tanstack/react-router";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import BN from "bn.js";
import { LuPlus, LuBuilding2, LuLock, LuArrowDownLeft, LuClock } from "react-icons/lu";

import { StreamList } from "@/components/streams/stream-list/stream-list";
import { Button } from "@/components/ui/button";
import { useApiStreams, type StreamWithEvents } from "@/hooks/use-stream-api";
import { useAuth } from "@/lib/solana/use-auth";
import { cn } from "@/utils/cn";
import { formatSol } from "@/utils/format";

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

interface DashboardStats {
  activeCount: number;
  totalAllocated: BN;
  totalWithdrawn: BN;
  claimable: BN;
  createdCount: number;
  receivedCount: number;
}

function computeStats(streams: StreamWithEvents[], walletAddress: string): DashboardStats {
  const stats: DashboardStats = {
    activeCount: 0,
    totalAllocated: new BN(0),
    totalWithdrawn: new BN(0),
    claimable: new BN(0),
    createdCount: 0,
    receivedCount: 0,
  };

  for (const s of streams) {
    if (s.status !== "active") continue;

    const isCreator = s.creatorAddress === walletAddress;
    if (!isCreator && s.recipientAddress !== walletAddress) continue;

    stats.activeCount++;
    stats.totalAllocated = stats.totalAllocated.add(new BN(s.amount));
    stats.totalWithdrawn = stats.totalWithdrawn.add(new BN(s.amountWithdrawn));

    if (isCreator) stats.createdCount++;
    else stats.receivedCount++;
  }

  return stats;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof LuLock;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg1 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <div className={cn("rounded-lg bg-bg2 p-1.5", color)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-1.5 text-lg font-bold text-text">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const { connected, publicKey } = useAuth();
  const { tab } = useSearch({ from: Route.id });
  const navigate = useNavigate();

  // Fetch both views for stats computation
  const walletAddress = publicKey?.toBase58();
  const { data: createdStreams } = useApiStreams({
    creator: walletAddress,
  });
  const { data: receivedStreams } = useApiStreams({
    recipient: walletAddress,
  });

  const allStreams = [...(createdStreams ?? []), ...(receivedStreams ?? [])];
  const uniqueStreams = allStreams.filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
  const stats = walletAddress ? computeStats(uniqueStreams, walletAddress) : null;

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

      {connected && stats && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Streams"
              value={`${stats.activeCount}`}
              icon={LuClock}
              color="text-primary"
            />
            <StatCard
              label="Total Allocated"
              value={formatSol(stats.totalAllocated, 6)}
              icon={LuLock}
              color="text-info"
            />
            <StatCard
              label="Total Claimed"
              value={formatSol(stats.totalWithdrawn, 6)}
              icon={LuArrowDownLeft}
              color="text-success"
            />
            <StatCard
              label="Claimable Now"
              value={formatSol(stats.claimable, 6)}
              icon={LuLock}
              color="text-warn"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => void navigate({ to: "/app/create" })}
              className="gap-1.5"
            >
              <LuPlus className="h-4 w-4" />
              Create Stream
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void navigate({ to: "/app/organizations" })}
              className="gap-1.5"
            >
              <LuBuilding2 className="h-4 w-4" />
              Organizations
            </Button>
          </div>
        </>
      )}

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-bg1 p-0.5">
        {tabs.map((t) => (
          <Link
            key={t.key}
            to="/app/dashboard"
            search={{ tab: t.key }}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-all no-underline hover:no-underline",
              tab === t.key ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text",
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
