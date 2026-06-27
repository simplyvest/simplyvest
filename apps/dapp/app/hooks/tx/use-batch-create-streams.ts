import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/solana/use-auth";
import { useConnection } from "@/lib/solana/use-connection";
import { useSolanaTransaction } from "@/lib/solana/use-solana-transaction";

import {
  buildReadProgram,
  BN,
  PROGRAM_ID,
  getStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
} from "./shared";

const BATCH_SIZE = 3;

interface BatchMember {
  recipient: PublicKey;
  amount: number;
}

interface BatchInput {
  members: BatchMember[];
  mint: PublicKey;
  startTime: number;
  endTime: number;
  cliffTime: number;
  orgId?: string;
}

interface StreamResult {
  recipient: string;
  streamPda: string;
  tx: string;
  amount: number;
}

interface BatchResult {
  success: StreamResult[];
  failed: { recipient: string; error: string; amount: number }[];
}

export function useBatchCreateStreams() {
  const { publicKey } = useAuth();
  const { connection } = useConnection();
  const { wallet, sendInstructions } = useSolanaTransaction();

  return useMutation({
    mutationFn: async (input: BatchInput): Promise<BatchResult> => {
      if (!publicKey || !wallet) throw new Error("Wallet not connected");

      const program = buildReadProgram(connection);

      const [creatorConfigPda] = getCreatorConfigPda(publicKey, PROGRAM_ID);
      const creatorConfig = await program.account.creatorConfig.fetchNullable(creatorConfigPda);
      const baseVestingCount = creatorConfig?.vestingCount ?? new BN(0);

      const instructions: {
        instruction: TransactionInstruction;
        streamPda: PublicKey;
        vaultPda: PublicKey;
        recipient: PublicKey;
        amount: number;
      }[] = [];

      for (let i = 0; i < input.members.length; i++) {
        const member = input.members[i];
        const vestingCount = baseVestingCount.add(new BN(i));

        const [streamPda] = getStreamPda(
          publicKey,
          member.recipient,
          input.mint,
          vestingCount,
          PROGRAM_ID,
        );
        const [vaultPda] = getVaultPda(streamPda, PROGRAM_ID);

        // eslint-disable-next-line no-await-in-loop
        const instruction = await program.methods
          .createStream({
            amount: new BN(member.amount),
            startTime: new BN(input.startTime),
            endTime: new BN(input.endTime),
            cliffTime: new BN(input.cliffTime),
          })
          .accountsPartial(
            getCreateStreamAccounts(
              publicKey,
              member.recipient,
              input.mint,
              streamPda,
              vaultPda,
              publicKey, // senderToken
              creatorConfigPda,
            ),
          )
          .instruction();

        instructions.push({
          instruction,
          streamPda,
          vaultPda,
          recipient: member.recipient,
          amount: member.amount,
        });
      }

      const result: BatchResult = { success: [], failed: [] };

      for (let i = 0; i < instructions.length; i += BATCH_SIZE) {
        const chunk = instructions.slice(i, i + BATCH_SIZE);
        const chunkIxns = chunk.map((c) => c.instruction);

        try {
          // eslint-disable-next-line no-await-in-loop
          const { signature } = await sendInstructions(connection, publicKey, chunkIxns);

          const records = chunk.map((item) =>
            api.post("/api/streams", {
              id: item.streamPda.toBase58(),
              type: "time",
              creatorAddress: publicKey.toBase58(),
              recipientAddress: item.recipient.toBase58(),
              mintAddress: input.mint.toBase58(),
              vaultAddress: item.vaultPda.toBase58(),
              amount: item.amount.toString(),
              orgId: input.orgId,
              startTime: input.startTime,
              endTime: input.endTime,
              cliffTime: input.cliffTime,
              creationTx: signature,
              createdAt: Math.floor(Date.now() / 1000),
            }),
          );

          // eslint-disable-next-line no-await-in-loop
          const settled = await Promise.allSettled(records);

          for (let j = 0; j < chunk.length; j++) {
            const item = chunk[j];
            if (settled[j].status === "fulfilled") {
              result.success.push({
                recipient: item.recipient.toBase58(),
                streamPda: item.streamPda.toBase58(),
                tx: signature,
                amount: item.amount,
              });
            } else {
              result.failed.push({
                recipient: item.recipient.toBase58(),
                error: "Stream created on-chain but failed to record",
                amount: item.amount,
              });
            }
          }
        } catch (err) {
          for (const item of chunk) {
            result.failed.push({
              recipient: item.recipient.toBase58(),
              error: err instanceof Error ? err.message : "Transaction failed",
              amount: item.amount,
            });
          }
          break;
        }
      }

      return result;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Batch creation failed");
    },
  });
}
