import { BN } from "@coral-xyz/anchor";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import type { PublicKey } from "@solana/web3.js";
import { createRoute } from "@tanstack/react-router";
import { LuArrowUpRight, LuArrowDownLeft, LuClock } from "react-icons/lu";

import { useStreams, useMilestoneStreams } from "@/hooks/use-stream";
import { useAuth } from "@/lib/solana/use-auth";
import { cn } from "@/utils/cn";
import { formatSol } from "@/utils/format";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/activity",
  component: ActivityPage,
});

interface ActivityItem {
  id: string;
  type: "created" | "received" | "milestone";
  streamType: "time" | "milestone";
  amount: BN;
  counterparty: string;
  timestamp: number;
}

const eventIcons = {
  created: LuArrowUpRight,
  received: LuArrowDownLeft,
  milestone: LuClock,
};

const eventLabels = {
  created: "Stream Created",
  received: "Stream Received",
  milestone: "Milestone Stream",
};

const eventColors = {
  created: "text-sol",
  received: "text-sol2",
  milestone: "text-sol3",
};

function buildActivityItems(
  streams: { publicKey: PublicKey; account: StreamAccount }[],
  milestoneStreams: { publicKey: PublicKey; account: MilestoneStreamAccount }[],
  walletAddress: string,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const s of streams) {
    const isCreator = s.account.creator.toBase58() === walletAddress;
    const counterparty = isCreator ? s.account.recipient.toBase58() : s.account.creator.toBase58();

    items.push({
      id: s.publicKey.toBase58(),
      type: isCreator ? "created" : "received",
      streamType: "time",
      amount: s.account.amount,
      counterparty,
      timestamp: Date.now(),
    });
  }

  for (const s of milestoneStreams) {
    const isCreator = s.account.creator.toBase58() === walletAddress;
    const counterparty = isCreator ? s.account.recipient.toBase58() : s.account.creator.toBase58();

    items.push({
      id: s.publicKey.toBase58(),
      type: "milestone",
      streamType: "milestone",
      amount: s.account.amount,
      counterparty,
      timestamp: Date.now(),
    });
  }

  return items.toSorted((a, b) => b.timestamp - a.timestamp);
}

function ActivityPage() {
  const { publicKey } = useAuth();
  const { data: streams, isLoading: streamsLoading } = useStreams();
  const { data: milestoneStreams, isLoading: milestoneLoading } = useMilestoneStreams();

  const isLoading = streamsLoading || milestoneLoading;
  const walletAddress = publicKey?.toBase58() ?? "";

  const activityItems = buildActivityItems(streams ?? [], milestoneStreams ?? [], walletAddress);

  if (!publicKey) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-bg1">
        <p className="text-sm text-muted">Connect your wallet to see activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Activity</h1>
        <p className="mt-1 text-sm text-muted">Your stream history</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-bg2" />
          ))}
        </div>
      ) : activityItems.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-bg1">
          <p className="text-sm text-muted">No streams yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activityItems.map((item) => {
            const Icon = eventIcons[item.type];
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-bg1 p-4"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full bg-bg2",
                    eventColors[item.type],
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text">{eventLabels[item.type]}</p>
                    <span className="rounded-full bg-bg2 px-2 py-0.5 text-xs text-dim capitalize">
                      {item.streamType}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-dim truncate">
                    {item.type === "created"
                      ? `To: ${item.counterparty.slice(0, 4)}...${item.counterparty.slice(-4)}`
                      : `With: ${item.counterparty.slice(0, 4)}...${item.counterparty.slice(-4)}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-text">{formatSol(item.amount, 6)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
