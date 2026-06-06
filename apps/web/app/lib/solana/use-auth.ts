import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

export interface AuthState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  user: {
    email?: string;
    google?: string;
  } | null;
}

export function useAuth(): AuthState {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const solanaWallet = wallets[0] ?? null;

  const publicKey = useMemo(() => {
    if (!solanaWallet?.address) return null;
    try {
      return new PublicKey(solanaWallet.address);
    } catch {
      return null;
    }
  }, [solanaWallet?.address]);

  const connected = authenticated && !!publicKey;
  const connecting = !ready;

  const userInfo = useMemo(() => {
    if (!user) return null;
    return {
      email: user.email?.address,
      google: user.google?.email,
    };
  }, [user]);

  return { publicKey, connected, connecting, user: userInfo };
}
