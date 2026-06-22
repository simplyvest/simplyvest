import type { PublicKey } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";
import { useSolanaTransaction } from "@/lib/solana/use-solana-transaction";

import { useRecordStreamEvent } from "../use-stream-api";
import { buildReadProgram, BN, getWithdrawAccounts } from "./shared";

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { wallet, sendInstructions } = useSolanaTransaction();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (input: {
      stream: PublicKey;
      vault: PublicKey;
      sender: PublicKey;
      mint: PublicKey;
      recipientToken: PublicKey;
      amount: number;
    }) => {
      if (!publicKey || !wallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .withdraw({ amount: new BN(input.amount) })
        .accountsPartial(
          getWithdrawAccounts(
            publicKey,
            input.stream,
            input.vault,
            input.recipientToken,
            input.sender,
            input.mint,
          ),
        )
        .instruction();

      const { signature } = await sendInstructions(connection, publicKey, [instruction]);
      return { tx: signature, stream: input.stream, amount: input.amount };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["stream", result.stream.toBase58()] });
      await queryClient.invalidateQueries({ queryKey: ["streams"] });
      if (publicKey) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "withdrawn",
          actorAddress: publicKey.toBase58(),
          amount: result.amount.toString(),
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
