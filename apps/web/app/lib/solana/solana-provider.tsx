import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors, useSolanaLedgerPlugin } from "@privy-io/react-auth/solana";
import * as React from "react";

import { ConnectionContext, connection } from "./connection-context";

function LedgerSetup() {
  useSolanaLedgerPlugin();
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
        {children}
      </ConnectionContext.Provider>
    </PrivyProvider>
  );
}
