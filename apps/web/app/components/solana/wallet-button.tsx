import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { Button } from "@/components/ui/button";

export function WalletButton() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { publicKey, connected, connecting } = wallet;

  if (connected && publicKey) {
    const short = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    return (
      <Button variant="secondary" size="sm" onClick={() => void wallet.disconnect()}>
        {short}
      </Button>
    );
  }

  return (
    <Button variant="brand" size="sm" onClick={() => setVisible(true)} disabled={connecting}>
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
