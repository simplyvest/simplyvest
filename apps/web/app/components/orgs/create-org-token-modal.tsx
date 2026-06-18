import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateOrgToken } from "@/hooks/use-api";

interface CreateOrgTokenModalProps {
  orgId: string;
  onClose: () => void;
}

export function CreateOrgTokenModal({ orgId, onClose }: CreateOrgTokenModalProps) {
  const updateToken = useUpdateOrgToken(orgId);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(9);
  const [amount, setAmount] = useState("");

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name || !symbol || !amount) return;

    updateToken.mutate(
      { action: "create", name, symbol, decimals, amount },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg1 p-0 shadow-xl">
          <Dialog.Title className="sr-only">Create Equity Token</Dialog.Title>
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-text">Create Equity Token</h2>
              <Dialog.Close
                className="rounded-lg p-1 text-muted transition-colors hover:bg-bg2"
                aria-label="Close"
              >
                <LuX className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Token Name</label>
                <Input
                  placeholder="ACME Equity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">Symbol</label>
                <Input
                  placeholder="ACME"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Decimals</label>
                  <Input
                    type="number"
                    min={0}
                    max={9}
                    value={decimals}
                    onChange={(e) => setDecimals(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Total Supply</label>
                  <Input
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-dim">
                This creates a fixed-supply SPL token on Solana and links it to your organization.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateToken.isPending || !name || !symbol || !amount}
                >
                  {updateToken.isPending ? "Creating..." : "Create Token"}
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
