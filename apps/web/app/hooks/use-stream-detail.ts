import {
  fetchStream,
  fetchMilestoneStream,
  getClaimable,
  getStatus,
  getVestedPercent,
  getMilestoneStatus,
  getMilestoneClaimable,
} from "@solana-tdp/sdk";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import BN from "bn.js";
import { useMemo } from "react";

import { useConnection } from "@/lib/solana/use-connection";

import { useStreamEvents } from "./use-stream-events";

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

  streamType: StreamType;
  status: StreamStatus;
  claimable: BN;
  vestedPercent: number;

  onChainAccount: StreamAccount | MilestoneStreamAccount | null;
}

export function useStreamDetail(pda: string | undefined) {
  const { connection } = useConnection();
  const apiQuery = useStreamEvents(pda ?? "");

  const onChainQuery = useQuery({
    queryKey: ["stream-onchain", pda],
    queryFn: async () => {
      if (!pda) return null;
      const pubkey = new PublicKey(pda);

      const timeStream = await fetchStream(connection, pubkey);
      if (timeStream) {
        return {
          type: "time" as const,
          account: timeStream.account,
          publicKey: timeStream.publicKey,
        };
      }

      const milestoneStream = await fetchMilestoneStream(connection, pubkey);
      if (milestoneStream) {
        return {
          type: "milestone" as const,
          account: milestoneStream.account,
          publicKey: milestoneStream.publicKey,
        };
      }

      return null;
    },
    enabled: !!pda,
    retry: 1,
  });

  const detail = useMemo<StreamDetail | null>(() => {
    if (!apiQuery.data || !onChainQuery.data) return null;

    const api = apiQuery.data;
    const onChain = onChainQuery.data;
    const clockTime = Math.floor(Date.now() / 1000);

    const account = onChain.account;

    let streamType: StreamType;
    if (onChain.type === "milestone") {
      streamType = "milestone";
    } else {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const timeAccount = account as StreamAccount;
      streamType = timeAccount.cliffTime.gt(timeAccount.startTime) ? "cliff" : "linear";
    }

    let status: StreamStatus;
    let claimable: BN;
    let vestedPercent: number;
    let cancelled: boolean;
    let milestoneReached: boolean;
    let amountWithdrawn: string;

    if (streamType === "milestone") {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const msAccount = account as MilestoneStreamAccount;
      status = getMilestoneStatus(msAccount);
      claimable = getMilestoneClaimable(msAccount);
      milestoneReached = msAccount.milestoneReached;
      cancelled = msAccount.cancelled;
      amountWithdrawn = msAccount.amountWithdrawn.toString();
      vestedPercent = milestoneReached
        ? msAccount.amountWithdrawn.gte(msAccount.amount)
          ? 100
          : Number(msAccount.amountWithdrawn.muln(100).div(msAccount.amount))
        : 0;
    } else {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const timeAccount = account as StreamAccount;
      status = getStatus(timeAccount);
      claimable = getClaimable(timeAccount, clockTime);
      cancelled = timeAccount.cancelled;
      milestoneReached = false;
      amountWithdrawn = timeAccount.amountWithdrawn.toString();
      vestedPercent = getVestedPercent(timeAccount, clockTime);
    }

    return {
      pda: api.id,
      apiType: api.type,
      creator: api.creatorAddress,
      recipient: api.recipientAddress,
      mint: api.mintAddress,
      vault: api.vaultAddress,
      amount: api.amount,
      startTime: api.startTime ?? undefined,
      endTime: api.endTime ?? undefined,
      cliffTime: api.cliffTime ?? undefined,
      milestoneAuthority: api.milestoneAuthority ?? undefined,
      creationTx: api.creationTx,
      orgId: api.orgId,
      createdAt: api.createdAt,
      amountWithdrawn,
      cancelled,
      milestoneReached,
      streamType,
      status,
      claimable,
      vestedPercent,
      onChainAccount: account,
    };
  }, [apiQuery.data, onChainQuery.data]);

  return {
    detail,
    isLoading: apiQuery.isLoading || onChainQuery.isLoading,
    isError: apiQuery.isError || onChainQuery.isError,
    error: apiQuery.error ?? onChainQuery.error,
    apiQuery,
    onChainQuery,
  };
}

export type { StreamDetail, StreamType, StreamStatus };
