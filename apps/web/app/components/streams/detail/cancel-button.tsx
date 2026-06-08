import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import { CancelDialog } from "@/components/streams/cancel-dialog";
import { Button } from "@/components/ui/button";
import type { StreamDetail } from "@/hooks/use-stream-detail";

export function CancelButton({ detail }: { detail: StreamDetail }) {
  const [open, setOpen] = useState(false);

  if (detail.status !== "active") return null;
  if (detail.streamType === "milestone") return null;

  // After guard: detail is TimeStreamDetail, so onChainAccount is StreamAccount
  const account = detail.onChainAccount;
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
