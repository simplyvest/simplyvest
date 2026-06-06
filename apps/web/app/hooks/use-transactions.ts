import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import {
  getStreamPda,
  getMilestoneStreamPda,
  getVaultPda,
  getCreatorConfigPda,
  getCreateStreamAccounts,
  getWithdrawAccounts,
  getCancelAccounts,
  getCreateMilestoneStreamAccounts,
  getTriggerMilestoneAccounts,
  getWithdrawMilestoneAccounts,
  getCancelMilestoneAccounts,
  SOLANA_TDP_PROGRAM_IDL,
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";
import { useAnchorSigner } from "@/lib/solana/use-anchor-signer";
import { useConnection } from "@/lib/solana/use-connection";
import type { Connection } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useRecordStream, useRecordStreamEvent } from "./use-api";

function buildProgram(connection: Connection, wallet: Wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);
}

export function useCreateStream() {
  const queryClient = useQueryClient();
  const wallet = useAnchorSigner();
  const { connection } = useConnection();
  const recordStream = useRecordStream();

  return useMutation({
    mutationFn: async (input: {
      recipient: web3.PublicKey;
      mint: web3.PublicKey;
      amount: number;
      startTime: number;
      endTime: number;
      cliffTime: number;
      senderToken: web3.PublicKey;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const [creatorConfigPda] = getCreatorConfigPda(wallet.publicKey, PROGRAM_ID);
      const creatorConfig = await program.account.creatorConfig.fetchNullable(creatorConfigPda);
      const vestingCount = creatorConfig?.vestingCount ?? new BN(0);

      const [streamPda] = getStreamPda(
        wallet.publicKey,
        input.recipient,
        input.mint,
        vestingCount,
        PROGRAM_ID,
      );
      const [vaultPda] = getVaultPda(streamPda, PROGRAM_ID);

      const tx = await program.methods
        .createStream({
          amount: new BN(input.amount),
          startTime: new BN(input.startTime),
          endTime: new BN(input.endTime),
          cliffTime: new BN(input.cliffTime),
        })
        .accountsPartial(
          getCreateStreamAccounts(
            wallet.publicKey,
            input.recipient,
            input.mint,
            streamPda,
            vaultPda,
            input.senderToken,
            creatorConfigPda,
          ),
        )
        .rpc();

      return { tx, streamPda, vaultPda, input };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["streams"] });
      await queryClient.invalidateQueries({ queryKey: ["creatorConfig"] });

      if (wallet) {
        recordStream.mutate({
          id: result.streamPda.toBase58(),
          type: "time",
          creatorAddress: wallet.publicKey.toBase58(),
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

export function useWithdraw() {
  const queryClient = useQueryClient();
  const wallet = useAnchorSigner();
  const { connection } = useConnection();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      sender: web3.PublicKey;
      mint: web3.PublicKey;
      recipientToken: web3.PublicKey;
      amount: number;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const tx = await program.methods
        .withdraw({ amount: new BN(input.amount) })
        .accountsPartial(
          getWithdrawAccounts(
            wallet.publicKey,
            input.stream,
            input.vault,
            input.recipientToken,
            input.sender,
            input.mint,
          ),
        )
        .rpc();

      return { tx, stream: input.stream, amount: input.amount };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["stream", result.stream.toBase58()],
      });
      await queryClient.invalidateQueries({ queryKey: ["streams"] });

      if (wallet) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "withdrawn",
          actorAddress: wallet.publicKey.toBase58(),
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

export function useCancel() {
  const queryClient = useQueryClient();
  const wallet = useAnchorSigner();
  const { connection } = useConnection();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (input: {
      recipient: web3.PublicKey;
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      senderToken: web3.PublicKey;
      recipientToken: web3.PublicKey;
      mint: web3.PublicKey;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const tx = await program.methods
        .cancel()
        .accountsPartial(
          getCancelAccounts(
            wallet.publicKey,
            input.recipient,
            input.stream,
            input.vault,
            input.senderToken,
            input.recipientToken,
            input.mint,
          ),
        )
        .rpc();

      return { tx, stream: input.stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["stream", result.stream.toBase58()],
      });
      await queryClient.invalidateQueries({ queryKey: ["streams"] });

      if (wallet) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "cancelled",
          actorAddress: wallet.publicKey.toBase58(),
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

export function useCreateMilestoneStream() {
  const queryClient = useQueryClient();
  const wallet = useAnchorSigner();
  const { connection } = useConnection();
  const recordStream = useRecordStream();

  return useMutation({
    mutationFn: async (input: {
      recipient: web3.PublicKey;
      milestoneAuthority: web3.PublicKey;
      mint: web3.PublicKey;
      amount: number;
      senderToken: web3.PublicKey;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const [creatorConfigPda] = getCreatorConfigPda(wallet.publicKey, PROGRAM_ID);
      const creatorConfig = await program.account.creatorConfig.fetchNullable(creatorConfigPda);
      const vestingCount = creatorConfig?.vestingCount ?? new BN(0);

      const [streamPda] = getMilestoneStreamPda(
        wallet.publicKey,
        input.recipient,
        input.mint,
        vestingCount,
        PROGRAM_ID,
      );
      const [vaultPda] = getVaultPda(streamPda, PROGRAM_ID);

      const tx = await program.methods
        .createMilestoneStream({ amount: new BN(input.amount) })
        .accountsPartial(
          getCreateMilestoneStreamAccounts(
            wallet.publicKey,
            input.recipient,
            input.milestoneAuthority,
            creatorConfigPda,
            streamPda,
            vaultPda,
            input.senderToken,
            input.mint,
          ),
        )
        .rpc();

      return { tx, streamPda, vaultPda, milestoneAuthority: input.milestoneAuthority, amount: input.amount, input };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });
      await queryClient.invalidateQueries({ queryKey: ["creatorConfig"] });

      if (wallet) {
        recordStream.mutate({
          id: result.streamPda.toBase58(),
          type: "milestone",
          creatorAddress: wallet.publicKey.toBase58(),
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

export function useTriggerMilestone() {
  const queryClient = useQueryClient();
  const wallet = useAnchorSigner();
  const { connection } = useConnection();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (stream: web3.PublicKey) => {
      if (!wallet) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const tx = await program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(wallet.publicKey, stream))
        .rpc();

      return { tx, stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["milestoneStream", result.stream.toBase58()],
      });
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });

      if (wallet) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "milestone_triggered",
          actorAddress: wallet.publicKey.toBase58(),
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

export function useWithdrawMilestone() {
  const queryClient = useQueryClient();
  const wallet = useAnchorSigner();
  const { connection } = useConnection();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      sender: web3.PublicKey;
      mint: web3.PublicKey;
      recipientToken: web3.PublicKey;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const tx = await program.methods
        .withdrawMilestone()
        .accountsPartial(
          getWithdrawMilestoneAccounts(
            wallet.publicKey,
            input.stream,
            input.vault,
            input.recipientToken,
            input.sender,
            input.mint,
          ),
        )
        .rpc();

      return { tx, stream: input.stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["milestoneStream", result.stream.toBase58()],
      });
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });

      if (wallet) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "completed",
          actorAddress: wallet.publicKey.toBase58(),
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

export function useCancelMilestone() {
  const queryClient = useQueryClient();
  const wallet = useAnchorSigner();
  const { connection } = useConnection();
  const recordEvent = useRecordStreamEvent();

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      senderToken: web3.PublicKey;
      mint: web3.PublicKey;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const tx = await program.methods
        .cancelMilestone()
        .accountsPartial(
          getCancelMilestoneAccounts(
            wallet.publicKey,
            input.stream,
            input.vault,
            input.senderToken,
            input.mint,
          ),
        )
        .rpc();

      return { tx, stream: input.stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["milestoneStream", result.stream.toBase58()],
      });
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });

      if (wallet) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "cancelled",
          actorAddress: wallet.publicKey.toBase58(),
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
