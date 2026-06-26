import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

interface StreamEventRecord {
  id: string;
  streamId: string;
  eventType: "created" | "withdrawn" | "milestone_triggered" | "completed" | "cancelled";
  actorAddress: string;
  amount: string | null;
  txSignature: string;
  blockTime: number;
  createdAt: number;
}

interface StreamWithEvents {
  id: string;
  type: "time" | "milestone";
  creatorAddress: string;
  recipientAddress: string;
  mintAddress: string;
  vaultAddress: string;
  amount: string;
  orgId: string | null;
  startTime: number | null;
  endTime: number | null;
  cliffTime: number | null;
  milestoneAuthority: string | null;
  milestoneReached: boolean;
  status: string;
  amountWithdrawn: string;
  creationTx: string;
  createdAt: number;
  closedAt: number | null;
  closeTx: string | null;
  events: StreamEventRecord[];
}

export function useStreamEvents(pda: string) {
  return useQuery({
    queryKey: ["api-stream", pda],
    queryFn: () => api.get<StreamWithEvents>(`/api/streams/${pda}`),
    enabled: !!pda,
  });
}

export type { StreamWithEvents, StreamEventRecord };
