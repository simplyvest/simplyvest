import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import { Transaction } from "@solana/web3.js";
import type { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";

const SOLANA_CHAIN = (import.meta.env.VITE_SOLANA_CHAIN ?? "solana:devnet") as string;

interface SendTxResult {
  signature: string;
}

/**
 * Wraps Privy's signAndSendTransaction with chain config and transaction building.
 * Centralizes Solana chain selection — change VITE_SOLANA_CHAIN to switch networks.
 */
export function useSolanaTransaction() {
  const { wallets } = useWallets();
  // oxlint-disable-next-line typescript/unbound-method
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const solanaWallet = wallets[0] ?? null;

  async function sendInstructions(
    connection: Connection,
    payer: PublicKey,
    instructions: TransactionInstruction[],
  ): Promise<SendTxResult> {
    if (!solanaWallet) throw new Error("Wallet not connected");

    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;
    tx.add(...instructions);

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    const { signature } = await signAndSendTransaction({
      transaction: new Uint8Array(serialized),
      wallet: solanaWallet,
      chain: SOLANA_CHAIN,
    });

    return { signature: Buffer.from(signature).toString("base64") };
  }

  return {
    wallet: solanaWallet,
    sendInstructions,
    chain: SOLANA_CHAIN,
  };
}
