import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { toSolanaWalletConnectors, useWallets } from "@privy-io/react-auth/solana";
import * as React from "react";

import { trackEvent } from "@/utils/analytics";

import { ConnectionContext, connection } from "./connection-context";

function LoginTracker() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const prevAuthRef = React.useRef(authenticated);

  React.useEffect(() => {
    if (authenticated && !prevAuthRef.current) {
      const wallet = wallets[0];
      const walletAddress = wallet?.address ?? "unknown";
      const loginMethod = user?.google
        ? "google"
        : user?.email
          ? "email"
          : user?.wallet
            ? "wallet"
            : "unknown";
      trackEvent("user_login", "engagement", walletAddress, undefined, {
        login_method: loginMethod,
      });
    }
    prevAuthRef.current = authenticated;
  }, [authenticated, wallets, user]);

  return null;
}

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID;

  if (!appId) {
    throw new Error("Missing VITE_PRIVY_APP_ID. Add it to your .env file.");
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId || undefined}
      config={{
        appearance: {
          walletChainType: "solana-only",
          walletList: ["phantom", "solflare", "detected_solana_wallets"],
        },
        embeddedWallets: {
          solana: { createOnLogin: "users-without-wallets" },
        },
        externalWallets: {
          solana: { connectors: toSolanaWalletConnectors() },
        },
        solana: {
          rpcs: {
            "solana:devnet": {
              rpc: import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com",
            },
          },
        },
      }}
    >
      <ConnectionContext.Provider value={connection}>
        <LoginTracker />
        {children}
      </ConnectionContext.Provider>
    </PrivyProvider>
  );
}
