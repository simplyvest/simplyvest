import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import * as React from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

import { trackEvent } from "@/utils/analytics";

const endpoint = import.meta.env.VITE_SOLANA_RPC_URL ?? clusterApiUrl("devnet");

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

function WalletTracker() {
  const { publicKey, connected, wallet } = useWallet();
  const prevConnectedRef = React.useRef(connected);

  React.useEffect(() => {
    if (connected && !prevConnectedRef.current && publicKey) {
      const walletName = wallet?.adapter?.name || "unknown";
      trackEvent("wallet_connect", "engagement", walletName, undefined, {
        wallet_address: publicKey.toBase58(),
      });
    }
    prevConnectedRef.current = connected;
  }, [connected, publicKey, wallet]);

  return null;
}

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
          <WalletTracker />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
