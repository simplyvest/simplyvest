import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { toSolanaWalletConnectors, useSolanaLedgerPlugin, useWallets } from "@privy-io/react-auth/solana";
import * as React from "react";

import { trackEvent } from "@/utils/analytics";

import { ConnectionContext, connection } from "./connection-context";

function LedgerSetup() {
  useSolanaLedgerPlugin();
  return null;
}

function LoginTracker() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const prevAuthRef = React.useRef(authenticated);

  React.useEffect(() => {
    if (authenticated && !prevAuthRef.current) {
      const wallet = wallets[0];
      const walletAddress = wallet?.address ?? "unknown";
      trackEvent("user_login", "engagement", walletAddress);
    }
    prevAuthRef.current = authenticated;
  }, [authenticated, wallets]);

  return null;
}

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID;

  if (!appId || !clientId) {
    throw new Error(
      "Missing VITE_PRIVY_APP_ID or VITE_PRIVY_CLIENT_ID. Add them to your .env file.",
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
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
      }}
    >
      <ConnectionContext.Provider value={connection}>
        <LedgerSetup />
        <LoginTracker />
        {children}
      </ConnectionContext.Provider>
    </PrivyProvider>
  );
}
