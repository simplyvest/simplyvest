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

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === "true";

const FAKE_PUBKEY = new PublicKey("DRpbCBMxVnDK7maPMpNpowE5J5fB4suoA1YpF8fZQmYP");

export function useAuth(): AuthState {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  // E2e test mode: skip Privy auth entirely and return a mock connected wallet.
  // Activated by VITE_DEV_AUTH_BYPASS=true in the e2e Playwright webServer config.
  // Never active in production builds (import.meta.env vars are replaced at build time).
  if (DEV_BYPASS) {
    return {
      publicKey: FAKE_PUBKEY,
      connected: true,
      connecting: false,
      user: { email: "e2e@simplyvest.test" },
    };
  }

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
