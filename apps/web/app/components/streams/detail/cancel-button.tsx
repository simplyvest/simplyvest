import type { StreamAccount } from "@solana-tdp/sdk";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import { CancelDialog } from "@/components/streams/cancel-dialog";
import { Button } from "@/components/ui/button";
import type { StreamDetail } from "@/hooks/use-stream-detail";

export function CancelButton({ detail }: { detail: StreamDetail }) {
  const [open, setOpen] = useState(false);

  if (detail.status !== "active") return null;

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const account = detail.onChainAccount as StreamAccount;
  const pda = new PublicKey(detail.pda);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Cancel Stream
      </Button>
      {open && <CancelDialog stream={account} pda={pda} onClose={() => setOpen(false)} />}
    </>
  );
}
