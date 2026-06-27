import BN from "bn.js";
import { useMemo } from "react";

import { useApiStream, type StreamWithEvents } from "@/hooks/use-stream-api";

type StreamType = "linear" | "cliff" | "milestone";
type StreamStatus = "active" | "completed" | "cancelled";

interface StreamDetail {
  pda: string;
  apiType: "time" | "milestone";
  creator: string;
  recipient: string;
  mint: string;
  vault: string;
  amount: string;
  startTime?: number;
  endTime?: number;
  cliffTime?: number;
  milestoneAuthority?: string;
  creationTx: string;
  orgId?: string | null;
  createdAt: number;

  amountWithdrawn: string;
  cancelled: boolean;
  milestoneReached: boolean;

  status: StreamStatus;
  claimable: BN;
  vestedPercent: number;
  streamType: StreamType;

  // Metadata
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  creatorDisplayName?: string;
  description?: string;

  // Raw API data for components that need it
  raw: StreamWithEvents;
}

function computeDetailFromApi(api: StreamWithEvents): StreamDetail {
  const clockTime = Math.floor(Date.now() / 1000);
  const startTime = api.startTime ?? 0;
  const endTime = api.endTime ?? 0;
  const cliffTime = api.cliffTime ?? 0;
  const amount = new BN(api.amount);
  const amountWithdrawn = new BN(api.amountWithdrawn ?? "0");
  const cancelled = api.status === "cancelled";
  const milestoneReached = api.milestoneReached ?? false;

  // Determine stream type
  const streamType: StreamType =
    api.type === "milestone" ? "milestone" : cliffTime > startTime ? "cliff" : "linear";

  // Compute status
  let status: StreamStatus;
  if (cancelled) status = "cancelled";
  else if (api.status === "completed") status = "completed";
  else if (endTime > 0 && clockTime >= endTime) status = "completed";
  else status = "active";

  // Compute claimable
  let claimable = new BN(0);
  let vestedPercent = 0;

  if (streamType === "milestone") {
    if (milestoneReached && !cancelled) {
      claimable = amount.sub(amountWithdrawn);
      if (claimable.lt(new BN(0))) claimable = new BN(0);
      vestedPercent = amount.gt(new BN(0)) ? amountWithdrawn.muln(100).div(amount).toNumber() : 0;
    }
  } else if (status === "active" && endTime > 0) {
    if (clockTime >= endTime) {
      claimable = amount.sub(amountWithdrawn);
      vestedPercent = 100;
    } else if (clockTime >= startTime) {
      const elapsed = clockTime - startTime;
      const duration = endTime - startTime;
      // Use BN .div() / .mul() instead of .divn() / .muln() because bn.js v5 limits
      // those to divisors/factors under ~67M — duration can exceed that for multi-year streams.
      const vested = amount.mul(new BN(elapsed)).div(new BN(duration));
      claimable = vested.sub(amountWithdrawn);
      if (claimable.lt(new BN(0))) claimable = new BN(0);
      vestedPercent = amount.gt(new BN(0)) ? vested.muln(100).div(amount).toNumber() : 0;
    }
  }

  return {
    pda: api.id,
    apiType: api.type,
    creator: api.creatorAddress,
    recipient: api.recipientAddress,
    mint: api.mintAddress,
    vault: api.vaultAddress,
    amount: api.amount,
    startTime: api.startTime,
    endTime: api.endTime,
    cliffTime: api.cliffTime,
    milestoneAuthority: api.milestoneAuthority,
    creationTx: api.creationTx,
    orgId: api.orgId,
    createdAt: api.createdAt,
    amountWithdrawn: api.amountWithdrawn ?? "0",
    cancelled,
    milestoneReached,
    status,
    claimable,
    vestedPercent,
    streamType,
    tokenName: api.tokenName,
    tokenSymbol: api.tokenSymbol,
    tokenDecimals: api.tokenDecimals,
    creatorDisplayName: api.creatorDisplayName,
    description: api.description,
    raw: api,
  };
}

export function useStreamDetail(pda: string | undefined) {
  const { data: apiData, isLoading, isError, error } = useApiStream(pda ?? "");

  const detail = useMemo<StreamDetail | null>(() => {
    if (!apiData) return null;
    return computeDetailFromApi(apiData);
  }, [apiData]);

  return {
    detail,
    isLoading,
    isError,
    error,
  };
}

export type { StreamDetail, StreamType, StreamStatus };
