import type { PublicKey } from "@solana/web3.js";
import { useConnection } from "@/lib/solana/use-connection";
import { useAuth } from "@/lib/solana/use-auth";
import { useSolanaTransaction } from "@/lib/solana/use-solana-transaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useRecordStreamEvent } from "../use-api";
import { buildReadProgram, getCancelAccounts } from "./shared";

export function useCancel() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { wallet, sendInstructions } = useSolanaTransaction();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (input: {
      recipient: PublicKey;
      stream: PublicKey;
      vault: PublicKey;
      senderToken: PublicKey;
      recipientToken: PublicKey;
      mint: PublicKey;
    }) => {
      if (!publicKey || !wallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .cancel()
        .accountsPartial(
          getCancelAccounts(publicKey, input.recipient, input.stream, input.vault, input.senderToken, input.recipientToken, input.mint),
        )
        .instruction();

      const { signature } = await sendInstructions(connection, publicKey, [instruction]);
      return { tx: signature, stream: input.stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["stream", result.stream.toBase58()] });
      await queryClient.invalidateQueries({ queryKey: ["streams"] });
      if (publicKey) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "cancelled",
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
