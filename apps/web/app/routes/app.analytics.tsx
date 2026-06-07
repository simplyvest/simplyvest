import { getClaimable, getStatus } from "@solana-tdp/sdk";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import type { PublicKey } from "@solana/web3.js";
import { createRoute } from "@tanstack/react-router";
import BN from "bn.js";
import {
  LuArrowUpRight,
  LuArrowDownLeft,
  LuLock,
  LuCircleCheck,
  LuBan,
  LuClock,
} from "react-icons/lu";

import { useStreams, useMilestoneStreams } from "@/hooks/use-stream";
import { useAuth } from "@/lib/solana/use-auth";
import { cn } from "@/utils/cn";
import { formatSol } from "@/utils/format";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

interface Stats {
  created: number;
  received: number;
  active: number;
  completed: number;
  cancelled: number;
  allocated: BN;
  vesting: BN;
  withdrawn: BN;
  claimable: BN;
}

function computeStats(
  streams: { publicKey: PublicKey; account: StreamAccount }[],
  milestoneStreams: { publicKey: PublicKey; account: MilestoneStreamAccount }[],
  walletAddress: string,
): Stats {
  const stats: Stats = {
    created: 0,
    received: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    allocated: new BN(0),
    vesting: new BN(0),
    withdrawn: new BN(0),
    claimable: new BN(0),
  };

  const clockTime = Math.floor(Date.now() / 1000);

  for (const s of streams) {
    const isCreator = s.account.creator.toBase58() === walletAddress;
    const status = getStatus(s.account);

    if (isCreator) stats.created++;
    else stats.received++;

    if (status === "active") stats.active++;
    else if (status === "completed") stats.completed++;
    else if (status === "cancelled") stats.cancelled++;

    stats.allocated = stats.allocated.add(s.account.amount);
    stats.withdrawn = stats.withdrawn.add(s.account.amountWithdrawn);

    if (status === "active") {
      stats.vesting = stats.vesting.add(s.account.amount.sub(s.account.amountWithdrawn));
    }

    if (isCreator) {
      const claim = getClaimable(s.account, clockTime);
      stats.claimable = stats.claimable.add(claim);
    }
  }

  for (const s of milestoneStreams) {
    const isCreator = s.account.creator.toBase58() === walletAddress;

    if (isCreator) stats.created++;
    else stats.received++;

    if (s.account.milestoneReached) stats.completed++;
    else stats.active++;

    stats.allocated = stats.allocated.add(s.account.amount);
    stats.withdrawn = stats.withdrawn.add(s.account.amountWithdrawn);

    if (!s.account.milestoneReached) {
      stats.vesting = stats.vesting.add(s.account.amount.sub(s.account.amountWithdrawn));
    }
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
  icon: typeof LuArrowUpRight;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg1 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <div className={cn("rounded-lg bg-bg2 p-2", color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-text">{value}</p>
    </div>
  );
}

function AnalyticsPage() {
  const { publicKey } = useAuth();
  const { data: streams, isLoading: streamsLoading } = useStreams();
  const { data: milestoneStreams, isLoading: milestoneLoading } = useMilestoneStreams();

  const isLoading = streamsLoading || milestoneLoading;
  const walletAddress = publicKey?.toBase58() ?? "";

  const stats = computeStats(streams ?? [], milestoneStreams ?? [], walletAddress);

  if (!publicKey) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-bg1">
        <p className="text-sm text-muted">Connect your wallet to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Portfolio overview and stream metrics</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-bg2" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Currently Vesting"
              value={formatSol(stats.vesting, 6)}
              icon={LuLock}
              color="text-sol"
            />
            <StatCard
              label="Already Claimed"
              value={formatSol(stats.withdrawn, 6)}
              icon={LuArrowDownLeft}
              color="text-sol2"
            />
            <StatCard
              label="Total Allocated"
              value={formatSol(stats.allocated, 6)}
              icon={LuArrowUpRight}
              color="text-sol3"
            />
            <StatCard
              label="Streams"
              value={`${stats.created + stats.received}`}
              icon={LuClock}
              color="text-muted"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg1 p-5">
              <div className="flex items-center gap-2">
                <LuClock className="h-4 w-4 text-sol" />
                <p className="text-sm font-medium text-text">Active</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-sol">{stats.active}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg1 p-5">
              <div className="flex items-center gap-2">
                <LuCircleCheck className="h-4 w-4 text-sol2" />
                <p className="text-sm font-medium text-text">Completed</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-sol2">{stats.completed}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg1 p-5">
              <div className="flex items-center gap-2">
                <LuBan className="h-4 w-4 text-warn" />
                <p className="text-sm font-medium text-text">Cancelled</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-warn">{stats.cancelled}</p>
            </div>
          </div>

          {stats.created + stats.received > 0 && (
            <div className="rounded-xl border border-border bg-bg1 p-5">
              <h3 className="text-sm font-medium text-text mb-4">Stream Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Total streams</span>
                  <span className="text-sm font-medium text-text">
                    {stats.created + stats.received}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">As creator</span>
                  <span className="text-sm font-medium text-text">{stats.created}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">As recipient</span>
                  <span className="text-sm font-medium text-text">{stats.received}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">Total allocated</span>
                  <span className="text-sm font-bold text-text">
                    {formatSol(stats.allocated, 6)} tokens
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Currently vesting</span>
                  <span className="text-sm font-medium text-sol">
                    {formatSol(stats.vesting, 6)} tokens
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Already claimed</span>
                  <span className="text-sm font-medium text-sol2">
                    {formatSol(stats.withdrawn, 6)} tokens
                  </span>
                </div>
              </div>
            </div>
          )}

          {streams?.length === 0 && milestoneStreams?.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-bg1">
              <p className="text-sm text-muted">No streams yet — create one to see analytics</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
