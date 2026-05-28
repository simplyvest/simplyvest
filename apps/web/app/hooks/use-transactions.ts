import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import {
  SolanaTdpIdl,
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
  PROGRAM_ID,
} from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import type { Connection } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function buildProgram(connection: Connection, wallet: WalletContextState) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const provider = new AnchorProvider(connection, wallet as unknown as Wallet, {
    commitment: "confirmed",
  });
  return new Program<SolanaTdp>(SolanaTdpIdl as SolanaTdp, provider);
}

export function useCreateStream() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const { connection } = useConnection();

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
      if (!wallet.publicKey) throw new Error("Wallet not connected");
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

      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      queryClient.invalidateQueries({ queryKey: ["creatorConfig"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      sender: web3.PublicKey;
      mint: web3.PublicKey;
      recipientToken: web3.PublicKey;
      amount: number;
    }) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
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

      return tx;
    },
    onSuccess: (_tx, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["stream", vars.stream.toBase58()],
      });
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}

export function useCancel() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMutation({
    mutationFn: async (input: {
      recipient: web3.PublicKey;
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      senderToken: web3.PublicKey;
      recipientToken: web3.PublicKey;
      mint: web3.PublicKey;
    }) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
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

      return tx;
    },
    onSuccess: (_tx, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["stream", vars.stream.toBase58()],
      });
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}

export function useCreateMilestoneStream() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMutation({
    mutationFn: async (input: {
      recipient: web3.PublicKey;
      milestoneAuthority: web3.PublicKey;
      mint: web3.PublicKey;
      amount: number;
      senderToken: web3.PublicKey;
    }) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
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

      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });
      queryClient.invalidateQueries({ queryKey: ["creatorConfig"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}

export function useTriggerMilestone() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMutation({
    mutationFn: async (stream: web3.PublicKey) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
      const program = buildProgram(connection, wallet);

      const tx = await program.methods
        .triggerMilestone()
        .accountsPartial(getTriggerMilestoneAccounts(wallet.publicKey, stream))
        .rpc();

      return tx;
    },
    onSuccess: (_tx, stream) => {
      queryClient.invalidateQueries({
        queryKey: ["milestoneStream", stream.toBase58()],
      });
      queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}

export function useWithdrawMilestone() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      sender: web3.PublicKey;
      mint: web3.PublicKey;
      recipientToken: web3.PublicKey;
    }) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
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

      return tx;
    },
    onSuccess: (_tx, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["milestoneStream", vars.stream.toBase58()],
      });
      queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}

export function useCancelMilestone() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMutation({
    mutationFn: async (input: {
      stream: web3.PublicKey;
      vault: web3.PublicKey;
      senderToken: web3.PublicKey;
      mint: web3.PublicKey;
    }) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
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

      return tx;
    },
    onSuccess: (_tx, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["milestoneStream", vars.stream.toBase58()],
      });
      queryClient.invalidateQueries({ queryKey: ["milestoneStreams"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    },
  });
}
