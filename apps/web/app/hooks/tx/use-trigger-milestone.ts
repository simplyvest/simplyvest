import type { PublicKey } from "@solana/web3.js";
import { useConnection } from "@/lib/solana/use-connection";
import { useAuth } from "@/lib/solana/use-auth";
import { useSolanaTransaction } from "@/lib/solana/use-solana-transaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useRecordStreamEvent } from "../use-api";
import { buildReadProgram, getTriggerMilestoneAccounts } from "./shared";

export function useTriggerMilestone() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { wallet, sendInstructions } = useSolanaTransaction();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (stream: PublicKey) => {
      if (!publicKey || !wallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(publicKey, stream))
        .instruction();

      const { signature } = await sendInstructions(connection, publicKey, [instruction]);
      return { tx: signature, stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["milestoneStream", result.stream.toBase58()] });
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });
      if (publicKey) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "milestone_triggered",
          actorAddress: publicKey.toBase58(),
          txSignature: result.tx,
          blockTime: Math.floor(Date.now() / 1000),
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}
