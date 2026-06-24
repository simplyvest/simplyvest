import {
  fetchStreams,
  fetchStreamsByCreator,
  fetchMilestoneStreams,
  fetchMilestoneStreamsByCreator,
  fetchCreatorConfig,
} from "@solana-tdp/sdk";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useProgram } from "./use-program";

export function useStreams(sender?: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["streams", sender?.toBase58()],
    queryFn: async () => {
      const { connection } = program.provider;
      if (sender) {
        return fetchStreamsByCreator(connection, sender, program.programId);
      }
      return fetchStreams(connection, program.programId);
    },
    enabled: true,
    retry: 1,
  });
}

export function useMilestoneStreams(creator?: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["milestoneStreams", creator?.toBase58()],
    queryFn: async () => {
      const { connection } = program.provider;
      if (creator) {
        return fetchMilestoneStreamsByCreator(connection, creator, program.programId);
      }
      return fetchMilestoneStreams(connection, program.programId);
    },
    enabled: true,
    retry: 1,
  });
}

export function useCreatorConfig(creator: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["creatorConfig", creator?.toBase58()],
    queryFn: async () => {
      if (!creator) throw new Error("Creator public key is required");
      const { connection } = program.provider;
      return fetchCreatorConfig(connection, creator, program.programId);
    },
    enabled: !!creator,
  });
}
