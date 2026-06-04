import { fetchStreams, fetchMilestoneStreams } from "@solana-tdp/sdk";
import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useProgram } from "./use-program";

export function useStreams(sender?: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["streams", sender?.toBase58()],
    queryFn: async () => {
      const { connection } = program.provider;
      const streams = await fetchStreams(connection, program.programId);
      if (sender) {
        return streams.filter((s: { publicKey: PublicKey; account: StreamAccount }) =>
          s.account.creator.equals(sender),
        );
      }
      return streams;
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
      const streams = await fetchMilestoneStreams(connection, program.programId);
      if (creator) {
        return streams.filter((s: { publicKey: PublicKey; account: MilestoneStreamAccount }) =>
          s.account.creator.equals(creator),
        );
      }
      return streams;
    },
    enabled: true,
    retry: 1,
  });
}

export function useCreatorConfig(creator: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["creatorConfig", creator?.toBase58()],
    queryFn: () => {
      if (!creator) throw new Error("Creator public key is required");
      return program.account.creatorConfig.fetchNullable(creator);
    },
    enabled: !!creator,
  });
}
