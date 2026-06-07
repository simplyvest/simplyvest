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
import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import { useConnection } from "@/lib/solana/use-connection";
import { useAuth } from "@/lib/solana/use-auth";
import type { Connection, PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useRecordStream, useRecordStreamEvent } from "./use-api";

/** Build a read-only program (no signing) */
function buildReadProgram(connection: Connection) {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const dummyWallet = {
    publicKey: PROGRAM_ID,
    signTransaction: async <T>(tx: T) => tx,
    signAllTransactions: async <T>(txs: T[]) => txs,
  } as unknown as Wallet;
  const provider = new AnchorProvider(connection, dummyWallet, {
    commitment: "confirmed",
  });
  return new Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);
}

/** Build an unsigned transaction from an Anchor instruction */
async function buildTx(
  connection: Connection,
  payer: PublicKey,
  instruction: web3.TransactionInstruction,
): Promise<Transaction> {
  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  tx.add(instruction);
  return tx;
}

export function useCreateStream() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const recordStream = useRecordStream();

  const solanaWallet = wallets[0] ?? null;

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
      if (!publicKey || !solanaWallet) throw new Error("Wallet not connected");
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
          getCreateStreamAccounts(
            publicKey,
            input.recipient,
            input.mint,
            streamPda,
            vaultPda,
            input.senderToken,
            creatorConfigPda,
          ),
        )
        .instruction();

      const tx = await buildTx(connection, publicKey, instruction);
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const { signature } = await signAndSendTransaction({
        transaction: new Uint8Array(serialized),
        wallet: solanaWallet,
      });

      return { tx: Buffer.from(signature).toString("base64"), streamPda, vaultPda, input };
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

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const recordEvent = useRecordStreamEvent();

  const solanaWallet = wallets[0] ?? null;

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      sender: web3.PublicKey;
      mint: web3.PublicKey;
      recipientToken: web3.PublicKey;
      amount: number;
    }) => {
      if (!publicKey || !solanaWallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .withdraw({ amount: new BN(input.amount) })
        .accountsPartial(
          getWithdrawAccounts(publicKey, input.stream, input.vault, input.recipientToken, input.sender, input.mint),
        )
        .instruction();

      const tx = await buildTx(connection, publicKey, instruction);
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const { signature } = await signAndSendTransaction({
        transaction: new Uint8Array(serialized),
        wallet: solanaWallet,
      });

      return { tx: Buffer.from(signature).toString("base64"), stream: input.stream, amount: input.amount };
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

export function useCancel() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const recordEvent = useRecordStreamEvent();

  const solanaWallet = wallets[0] ?? null;

  return useMutation({
    mutationFn: async (input: {
      recipient: web3.PublicKey;
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      senderToken: web3.PublicKey;
      recipientToken: web3.PublicKey;
      mint: web3.PublicKey;
    }) => {
      if (!publicKey || !solanaWallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .cancel()
        .accountsPartial(
          getCancelAccounts(publicKey, input.recipient, input.stream, input.vault, input.senderToken, input.recipientToken, input.mint),
        )
        .instruction();

      const tx = await buildTx(connection, publicKey, instruction);
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const { signature } = await signAndSendTransaction({
        transaction: new Uint8Array(serialized),
        wallet: solanaWallet,
      });

      return { tx: Buffer.from(signature).toString("base64"), stream: input.stream };
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

export function useCreateMilestoneStream() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const recordStream = useRecordStream();

  const solanaWallet = wallets[0] ?? null;

  return useMutation({
    mutationFn: async (input: {
      recipient: web3.PublicKey;
      milestoneAuthority: web3.PublicKey;
      mint: web3.PublicKey;
      amount: number;
      senderToken: web3.PublicKey;
    }) => {
      if (!publicKey || !solanaWallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const [creatorConfigPda] = getCreatorConfigPda(publicKey, PROGRAM_ID);
      const creatorConfig = await program.account.creatorConfig.fetchNullable(creatorConfigPda);
      const vestingCount = creatorConfig?.vestingCount ?? new BN(0);

      const [streamPda] = getMilestoneStreamPda(publicKey, input.recipient, input.mint, vestingCount, PROGRAM_ID);
      const [vaultPda] = getVaultPda(streamPda, PROGRAM_ID);

      const instruction = await program.methods
        .createMilestoneStream({ amount: new BN(input.amount) })
        .accountsPartial(
          getCreateMilestoneStreamAccounts(
            publicKey,
            input.recipient,
            input.milestoneAuthority,
            creatorConfigPda,
            streamPda,
            vaultPda,
            input.senderToken,
            input.mint,
          ),
        )
        .instruction();

      const tx = await buildTx(connection, publicKey, instruction);
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const { signature } = await signAndSendTransaction({
        transaction: new Uint8Array(serialized),
        wallet: solanaWallet,
      });

      return {
        tx: Buffer.from(signature).toString("base64"),
        streamPda,
        vaultPda,
        milestoneAuthority: input.milestoneAuthority,
        amount: input.amount,
        input,
      };
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

export function useTriggerMilestone() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const recordEvent = useRecordStreamEvent();

  const solanaWallet = wallets[0] ?? null;

  return useMutation({
    mutationFn: async (stream: web3.PublicKey) => {
      if (!publicKey || !solanaWallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(publicKey, stream))
        .instruction();

      const tx = await buildTx(connection, publicKey, instruction);
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const { signature } = await signAndSendTransaction({
        transaction: new Uint8Array(serialized),
        wallet: solanaWallet,
      });

      return { tx: Buffer.from(signature).toString("base64"), stream };
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

export function useWithdrawMilestone() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const recordEvent = useRecordStreamEvent();

  const solanaWallet = wallets[0] ?? null;

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      sender: web3.PublicKey;
      mint: web3.PublicKey;
      recipientToken: web3.PublicKey;
    }) => {
      if (!publicKey || !solanaWallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .withdrawMilestone()
        .accountsPartial(
          getWithdrawMilestoneAccounts(publicKey, input.stream, input.vault, input.recipientToken, input.sender, input.mint),
        )
        .instruction();

      const tx = await buildTx(connection, publicKey, instruction);
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const { signature } = await signAndSendTransaction({
        transaction: new Uint8Array(serialized),
        wallet: solanaWallet,
      });

      return { tx: Buffer.from(signature).toString("base64"), stream: input.stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["milestoneStream", result.stream.toBase58()] });
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });

      if (publicKey) {
        recordEvent.mutate({
          streamId: result.stream.toBase58(),
          eventType: "completed",
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

export function useCancelMilestone() {
  const queryClient = useQueryClient();
  const { publicKey } = useAuth();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const recordEvent = useRecordStreamEvent();

  const solanaWallet = wallets[0] ?? null;

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      senderToken: web3.PublicKey;
      mint: web3.PublicKey;
    }) => {
      if (!publicKey || !solanaWallet) throw new Error("Wallet not connected");
      const program = buildReadProgram(connection);

      const instruction = await program.methods
        .cancelMilestone()
        .accountsPartial(
          getCancelMilestoneAccounts(publicKey, input.stream, input.vault, input.senderToken, input.mint),
        )
        .instruction();

      const tx = await buildTx(connection, publicKey, instruction);
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const { signature } = await signAndSendTransaction({
        transaction: new Uint8Array(serialized),
        wallet: solanaWallet,
      });

      return { tx: Buffer.from(signature).toString("base64"), stream: input.stream };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["milestoneStream", result.stream.toBase58()] });
      await queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });

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
