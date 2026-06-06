import type { Wallet } from "@coral-xyz/anchor";
import { useSignTransaction, useWallets } from "@privy-io/react-auth/solana";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useMemo } from "react";

export function useAnchorSigner(): Wallet | null {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();

  const solanaWallet = useMemo(() => {
    return wallets.find((w) => w.chainType === "solana") ?? null;
  }, [wallets]);

  return useMemo(() => {
    if (!solanaWallet) return null;

    const publicKey = new PublicKey(solanaWallet.address);

    return {
      publicKey,
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
        const serialized = tx.serialize();
        const { signedTransaction } = await signTransaction({
          transaction: new Uint8Array(serialized),
          wallet: solanaWallet,
        });
        const buffer = Buffer.from(signedTransaction);
        if ("version" in tx) {
          return VersionedTransaction.deserialize(buffer) as T;
        }
        return Transaction.deserialize(buffer) as T;
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(
        txs: T[],
      ): Promise<T[]> => {
        return Promise.all(
          txs.map(async (tx) => {
            const serialized = tx.serialize();
            const { signedTransaction } = await signTransaction({
              transaction: new Uint8Array(serialized),
              wallet: solanaWallet,
            });
            const buffer = Buffer.from(signedTransaction);
            if ("version" in tx) {
              return VersionedTransaction.deserialize(buffer) as T;
            }
            return Transaction.deserialize(buffer) as T;
          }),
        );
      },
    } as Wallet;
  }, [solanaWallet, signTransaction]);
}
