import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";

interface StreamRecord {
  id: string;
  type: "time" | "milestone";
  creatorAddress: string;
  recipientAddress: string;
  mintAddress: string;
  vaultAddress: string;
  amount: string;
  orgId?: string;
  startTime?: number;
  endTime?: number;
  cliffTime?: number;
  milestoneAuthority?: string;
  creationTx: string;
  createdAt: number;
}

interface StreamEventRecord {
  eventType: "created" | "withdrawn" | "milestone_triggered" | "completed" | "cancelled";
  actorAddress: string;
  amount?: string;
  txSignature: string;
  blockTime: number;
}

interface StreamWithEvents extends StreamRecord {
  status: string;
  amountWithdrawn: string;
  closedAt: number | null;
  closeTx: string | null;
  events: StreamEventRecord[];
}

export function useRecordStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StreamRecord) => api.post("/api/streams", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-streams"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to record stream");
    },
  });
}

export function useRecordStreamEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streamId, ...input }: StreamEventRecord & { streamId: string }) =>
      api.post(`/api/streams/${streamId}/events`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-streams"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to record event");
    },
  });
}

export function useApiStreams(filters: {
  creator?: string;
  recipient?: string;
  org?: string;
  status?: string;
  type?: string;
}) {
  const params = new URLSearchParams();
  if (filters.creator) params.set("creator", filters.creator);
  if (filters.recipient) params.set("recipient", filters.recipient);
  if (filters.org) params.set("org", filters.org);
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);

  const qs = params.toString();
  const path = `/api/streams${qs ? `?${qs}` : ""}`;

  return useQuery({
    queryKey: ["api-streams", filters],
    queryFn: () => api.get<StreamWithEvents[]>(path),
  });
}

export function useApiStream(id: string) {
  return useQuery({
    queryKey: ["api-stream", id],
    queryFn: () => api.get<StreamWithEvents>(`/api/streams/${id}`),
    enabled: !!id,
  });
}
