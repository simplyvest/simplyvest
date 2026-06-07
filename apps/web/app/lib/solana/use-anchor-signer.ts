import type { Wallet } from "@coral-xyz/anchor";
import { useSignTransaction, useWallets } from "@privy-io/react-auth/solana";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useMemo } from "react";

export function useAnchorSigner(): Wallet | null {
  const { wallets } = useWallets();
  // oxlint-disable-next-line typescript/unbound-method
  const { signTransaction: privySignTransaction } = useSignTransaction();

  const solanaWallet = wallets[0] ?? null;

  return useMemo(() => {
    if (!solanaWallet) return null;

    const publicKey = new PublicKey(solanaWallet.address);

    const signTransaction = async <T extends Transaction | VersionedTransaction>(
      tx: T,
    ): Promise<T> => {
      // Serialize without requiring signatures (transaction isn't signed yet)
      let serialized: Uint8Array;
      if ("version" in tx) {
        serialized = tx.serialize();
      } else {
        // For legacy Transaction, serialize without requiring signatures
        serialized = new Uint8Array(
          (tx as Transaction).serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        );
      }

      const { signedTransaction } = await privySignTransaction({
        transaction: serialized,
        wallet: solanaWallet,
      });

      // Deserialize the signed transaction
      const buffer = Buffer.from(signedTransaction);
      if ("version" in tx) {
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        return VersionedTransaction.deserialize(buffer) as T;
      }
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return Transaction.from(buffer) as T;
    };

    const signAllTransactions = async <T extends Transaction | VersionedTransaction>(
      txs: T[],
    ): Promise<T[]> => {
      return Promise.all(txs.map((tx) => signTransaction(tx)));
    };

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return { publicKey, signTransaction, signAllTransactions } as Wallet;
  }, [solanaWallet, privySignTransaction]);
}
