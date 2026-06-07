import type { PublicKey } from "@solana/web3.js";
import { useConnection } from "@/lib/solana/use-connection";
import { useAuth } from "@/lib/solana/use-auth";
import { useSolanaTransaction } from "@/lib/solana/use-solana-transaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useRecordStream } from "../use-api";
import {
  buildReadProgram,
  BN,
  PROGRAM_ID,
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateMilestoneStreamAccounts,
} from "./shared";

export function useCreateMilestoneStream() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { wallet, sendInstructions } = useSolanaTransaction();
  const recordStream = useRecordStream();

  return useMutation({
    mutationFn: async (input: {
      recipient: PublicKey;
      milestoneAuthority: PublicKey;
      mint: PublicKey;
      amount: number;
      senderToken: PublicKey;
    }) => {
      if (!publicKey || !wallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const [creatorConfigPda] = getCreatorConfigPda(publicKey, PROGRAM_ID);
      const creatorConfig = await program.account.creatorConfig.fetchNullable(creatorConfigPda);
      const vestingCount = creatorConfig?.vestingCount ?? new BN(0);

      const [streamPda] = getMilestoneStreamPda(publicKey, input.recipient, input.mint, vestingCount, PROGRAM_ID);
      const [vaultPda] = getVaultPda(streamPda, PROGRAM_ID);

      const instruction = await program.methods
        .createMilestoneStream({ amount: new BN(input.amount) })
        .accountsPartial(
          getCreateMilestoneStreamAccounts(publicKey, input.recipient, input.milestoneAuthority, creatorConfigPda, streamPda, vaultPda, input.senderToken, input.mint),
        )
        .instruction();

      const { signature } = await sendInstructions(connection, publicKey, [instruction]);
      return { tx: signature, streamPda, vaultPda, milestoneAuthority: input.milestoneAuthority, amount: input.amount, input };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });
      await queryClient.invalidateQueries({ queryKey: ["creatorConfig"] });
      if (publicKey) {
        recordStream.mutate({
          id: result.streamPda.toBase58(),
          type: "milestone",
          creatorAddress: publicKey.toBase58(),
          recipientAddress: result.input.recipient.toBase58(),
          mintAddress: result.input.mint.toBase58(),
          vaultAddress: result.vaultPda.toBase58(),
          amount: result.amount.toString(),
          milestoneAuthority: result.milestoneAuthority.toBase58(),
          creationTx: result.tx,
          createdAt: Math.floor(Date.now() / 1000),
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}
