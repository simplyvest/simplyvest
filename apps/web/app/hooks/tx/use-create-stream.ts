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
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
} from "./shared";

export function useCreateStream() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { wallet, sendInstructions } = useSolanaTransaction();
  const recordStream = useRecordStream();

  return useMutation({
    mutationFn: async (input: {
      recipient: PublicKey;
      mint: PublicKey;
      amount: number;
      startTime: number;
      endTime: number;
      cliffTime: number;
      senderToken: PublicKey;
    }) => {
      if (!publicKey || !wallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const [creatorConfigPda] = getCreatorConfigPda(publicKey, PROGRAM_ID);
      const creatorConfig = await program.account.creatorConfig.fetchNullable(creatorConfigPda);
      const vestingCount = creatorConfig?.vestingCount ?? new BN(0);

      const [streamPda] = getStreamPda(publicKey, input.recipient, input.mint, vestingCount, PROGRAM_ID);
      const [vaultPda] = getVaultPda(streamPda, PROGRAM_ID);

      const instruction = await program.methods
        .createStream({
          amount: new BN(input.amount),
          startTime: new BN(input.startTime),
          endTime: new BN(input.endTime),
          cliffTime: new BN(input.cliffTime),
        })
        .accountsPartial(
          getCreateStreamAccounts(publicKey, input.recipient, input.mint, streamPda, vaultPda, input.senderToken, creatorConfigPda),
        )
        .instruction();

      const { signature } = await sendInstructions(connection, publicKey, [instruction]);
      return { tx: signature, streamPda, vaultPda, input };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["streams"] });
      await queryClient.invalidateQueries({ queryKey: ["creatorConfig"] });
      if (publicKey) {
        recordStream.mutate({
          id: result.streamPda.toBase58(),
          type: "time",
          creatorAddress: publicKey.toBase58(),
          recipientAddress: result.input.recipient.toBase58(),
          mintAddress: result.input.mint.toBase58(),
          vaultAddress: result.vaultPda.toBase58(),
          amount: result.input.amount.toString(),
          startTime: result.input.startTime,
          endTime: result.input.endTime,
          cliffTime: result.input.cliffTime,
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
