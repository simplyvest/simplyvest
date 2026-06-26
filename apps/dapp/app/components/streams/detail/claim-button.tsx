import { Button } from "@simplyvest/ui/button";
import { getVaultPda, PROGRAM_ID } from "@solana-tdp/sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import { useWithdraw } from "@/hooks/tx/use-withdraw";
import type { StreamDetail } from "@/hooks/use-stream-detail";
import { useAuth } from "@/lib/solana/use-auth";

export function ClaimButton({ detail }: { detail: StreamDetail }) {
  const { publicKey } = useAuth();
  const withdraw = useWithdraw();

  const claimable = detail.claimable.toNumber();
  const isActive = detail.status === "active";
  const canClaim = isActive && claimable > 0;

  if (!canClaim) return null;

  const handleClaim = () => {
    if (!publicKey) return;
    const pda = new PublicKey(detail.pda);
    const [vaultPda] = getVaultPda(pda, PROGRAM_ID);
    const mintPk = new PublicKey(detail.mint);
    const recipientToken = getAssociatedTokenAddressSync(mintPk, publicKey);

    withdraw.mutate({
      stream: pda,
      vault: vaultPda,
      sender: new PublicKey(detail.creator),
      mint: mintPk,
      recipientToken,
      amount: claimable,
    });
  };

  return (
    <Button onClick={handleClaim} disabled={withdraw.isPending}>
      {withdraw.isPending ? "Claiming..." : `Claim ${claimable.toLocaleString()} tokens`}
    </Button>
  );
}
