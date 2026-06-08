import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";

type StreamStatus = "active" | "completed" | "cancelled" | "orphaned";

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
  // New metadata fields
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  creatorDisplayName?: string;
  description?: string;
}

interface StreamEventRecord {
  eventType: "created" | "withdrawn" | "milestone_triggered" | "completed" | "cancelled";
  actorAddress: string;
  amount?: string;
  txSignature: string;
  blockTime: number;
}

interface StreamWithEvents extends StreamRecord {
  status: StreamStatus;
  amountWithdrawn: string;
  milestoneReached: boolean;
  closedAt: number | null;
  closeTx: string | null;
  lastSyncedAt: number | null;
  events: StreamEventRecord[];
}

export type { StreamRecord, StreamEventRecord, StreamWithEvents };

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

export function useStreamSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) => api.post(`/api/streams/${streamId}/sync`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-streams"] });
      void queryClient.invalidateQueries({ queryKey: ["api-stream"] });
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

// User profile types
interface UserProfile {
  id: string;
  walletAddress: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string;
  email?: string;
}

// User profile hooks
export function useUserProfile() {
  const { getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      try {
        return await api.get<UserProfile>("/api/users/me", { token });
      } catch (err) {
        // 404 means user hasn't been created yet — return null
        if (err instanceof Error && err.message.includes("not found")) {
          return null;
        }
        throw err;
      }
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.put<UserProfile>("/api/users/me", input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async (input: { walletAddress: string; displayName?: string; email?: string }) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.post<UserProfile>("/api/users/me", input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create profile");
    },
  });
}

// Organization types
interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
}

interface UserOrg extends Organization {
  role: "owner" | "admin" | "member";
}

interface OrgMember {
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  walletAddress: string;
  displayName: string | null;
}

interface OrgWithMembers extends Organization {
  members: OrgMember[];
}

interface CreateOrgInput {
  name: string;
  slug: string;
  description?: string;
}

// Organization hooks
export function useCreateOrg() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async (input: CreateOrgInput) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.post<Organization>("/api/orgs", input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      toast.success("Organization created");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
    },
  });
}

export function useOrg(id: string) {
  return useQuery({
    queryKey: ["org", id],
    queryFn: () => api.get<OrgWithMembers>(`/api/orgs/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrg(orgId: string) {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async (input: { name?: string; description?: string | null }) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.put<Organization>(`/api/orgs/${orgId}`, input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      void queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      toast.success("Organization updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update organization");
    },
  });
}

export function useUserOrgs() {
  const { getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ["user-orgs"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.get<UserOrg[]>("/api/orgs/me/list", { token });
    },
  });
}

export function useAddOrgMember() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async ({
      orgId,
      userId,
      role,
    }: {
      orgId: string;
      userId: string;
      role: "admin" | "member";
    }) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.post<OrgMember>(`/api/orgs/${orgId}/members`, { userId, role }, token);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["org", variables.orgId] });
      toast.success("Member added");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add member");
    },
  });
}

export function useRemoveOrgMember() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async ({ orgId, userId }: { orgId: string; userId: string }) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/api/orgs/${orgId}/members/${userId}`, token);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["org", variables.orgId] });
      toast.success("Member removed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    },
  });
}
