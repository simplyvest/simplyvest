import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useProgram } from "./use-program";

export function useStream(pda: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["stream", pda?.toBase58()],
    queryFn: () => {
      if (!pda) throw new Error("Stream PDA is required");
      return program.account.streamAccount.fetch(pda);
    },
    enabled: !!pda,
  });
}

export function useStreams(sender?: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["streams", sender?.toBase58()],
    queryFn: async () => {
      const streams = await program.account.streamAccount.all();
      if (sender) {
        return streams.filter((s) => s.account.sender.equals(sender));
      }
      return streams;
    },
    enabled: true,
  });
}

export function useMilestoneStream(pda: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["milestoneStream", pda?.toBase58()],
    queryFn: () => {
      if (!pda) throw new Error("MilestoneStream PDA is required");
      return program.account.milestoneStreamAccount.fetch(pda);
    },
    enabled: !!pda,
  });
}

export function useMilestoneStreams(creator?: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["milestoneStreams", creator?.toBase58()],
    queryFn: async () => {
      const streams = await program.account.milestoneStreamAccount.all();
      if (creator) {
        return streams.filter((s) => s.account.creator.equals(creator));
      }
      return streams;
    },
    enabled: true,
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
