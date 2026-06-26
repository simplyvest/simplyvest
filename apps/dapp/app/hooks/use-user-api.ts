import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";

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

export type { UserProfile, UpdateProfileInput };

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
