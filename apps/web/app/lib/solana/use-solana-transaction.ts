import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import { Transaction } from "@solana/web3.js";
import type { Connection, Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";

const envChain = import.meta.env.VITE_SOLANA_CHAIN;
const SOLANA_CHAIN: string = typeof envChain === "string" ? envChain : "solana:devnet";

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
    opts?: { signers?: Keypair[] },
  ): Promise<SendTxResult> {
    if (!solanaWallet) throw new Error("Wallet not connected");

    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;
    tx.add(...instructions);

    if (opts?.signers?.length) {
      tx.partialSign(...opts.signers);
    }

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    const { signature } = await signAndSendTransaction({
      transaction: new Uint8Array(serialized),
      wallet: solanaWallet,
      chain: SOLANA_CHAIN,
      options: {
        sponsor: true,
      },
    });

    return { signature: Buffer.from(signature).toString("base64") };
  }

  return {
    wallet: solanaWallet,
    sendInstructions,
    chain: SOLANA_CHAIN,
  };
}
