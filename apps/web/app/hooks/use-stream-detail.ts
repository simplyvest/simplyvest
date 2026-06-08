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

interface StreamDetailBase {
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
}

interface TimeStreamDetail extends StreamDetailBase {
  streamType: "linear" | "cliff";
  onChainAccount: StreamAccount;
}

interface MilestoneStreamDetail extends StreamDetailBase {
  streamType: "milestone";
  onChainAccount: MilestoneStreamAccount;
}

type StreamDetail = TimeStreamDetail | MilestoneStreamDetail;

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

    const base = {
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
    };

    if (onChain.type === "milestone") {
      const account = onChain.account;
      const milestoneReached = account.milestoneReached;
      const status = getMilestoneStatus(account);
      const claimable = getMilestoneClaimable(account);
      const vestedPercent = milestoneReached
        ? account.amountWithdrawn.gte(account.amount)
          ? 100
          : Number(account.amountWithdrawn.muln(100).div(account.amount))
        : 0;

      return {
        ...base,
        amountWithdrawn: account.amountWithdrawn.toString(),
        cancelled: account.cancelled,
        milestoneReached,
        streamType: "milestone",
        status,
        claimable,
        vestedPercent,
        onChainAccount: account,
      } satisfies MilestoneStreamDetail;
    }

    const account = onChain.account;
    const streamType = account.cliffTime.gt(account.startTime) ? "cliff" : "linear";
    const status = getStatus(account);
    const claimable = getClaimable(account, clockTime);
    const vestedPercent = getVestedPercent(account, clockTime);

    return {
      ...base,
      amountWithdrawn: account.amountWithdrawn.toString(),
      cancelled: account.cancelled,
      milestoneReached: false,
      streamType,
      status,
      claimable,
      vestedPercent,
      onChainAccount: account,
    } satisfies TimeStreamDetail;
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

export type { StreamDetail, TimeStreamDetail, MilestoneStreamDetail, StreamType, StreamStatus };
