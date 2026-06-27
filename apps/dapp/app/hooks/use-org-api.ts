import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  mintAddress: string | null;
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number | null;
  tokenSupply: string | null;
}

interface UserOrg extends Organization {
  role: "owner" | "admin" | "member";
}

interface OrgMember {
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  walletAddress: string | null;
  privyId: string | null;
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

type OrgTokenInput =
  | {
      action: "create";
      name: string;
      symbol: string;
      decimals: number;
      amount: string;
      walletAddress: string;
    }
  | {
      action: "link";
      mintAddress: string;
      tokenName?: string | null;
      tokenSymbol?: string | null;
      tokenDecimals?: number;
    };

export type { Organization, UserOrg, OrgMember, OrgWithMembers, CreateOrgInput, OrgTokenInput };

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

export function useUpdateOrgToken(orgId: string) {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async (input: OrgTokenInput) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.put<Organization>(`/api/orgs/${orgId}/token`, input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      void queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      toast.success("Token updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update token");
    },
  });
}

export function useRemoveOrgToken(orgId: string) {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/api/orgs/${orgId}/token`, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      void queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      toast.success("Token removed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove token");
    },
  });
}

export function useDeleteOrg() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  return useMutation({
    mutationFn: async (orgId: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/api/orgs/${orgId}`, token);
    },
    onSuccess: (_data, orgId) => {
      void queryClient.invalidateQueries({ queryKey: ["org", orgId] });
      void queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      toast.success("Organization deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete organization");
    },
  });
}
