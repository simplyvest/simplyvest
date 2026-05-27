import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export function WalletButton() {
  const { publicKey, disconnect, connected, connecting, wallet, connect } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connect().catch(() => {});
    }
  }, [wallet, connected, connecting, connect]);

  if (connected && publicKey) {
    const short = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    return (
      <Button variant="secondary" size="sm" onClick={() => disconnect()}>
        {short}
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={() => setVisible(true)} disabled={connecting}>
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
