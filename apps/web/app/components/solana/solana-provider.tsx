import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import * as React from "react";
import { toast } from "sonner";
import "@solana/wallet-adapter-react-ui/styles.css";

const endpoint = import.meta.env.VITE_SOLANA_RPC_URL ?? clusterApiUrl("devnet");

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
        onError={(error) => {
          console.error("Wallet error:", error);
          toast.error(error.message || "Wallet connection failed");
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
