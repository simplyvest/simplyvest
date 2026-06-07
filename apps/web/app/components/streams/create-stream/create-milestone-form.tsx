import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useState, useMemo } from "react";

import { useAuth } from "@/lib/solana/use-auth";
import { TokenSelector } from "@/components/tokens/token-selector/token-selector";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateMilestoneStream } from "@/hooks/tx/use-create-milestone-stream";

import { StreamCreationSuccess } from "./stream-creation-success";
import { isValidPubkey } from "./utils";

export function CreateMilestoneForm() {
  const { publicKey } = useAuth();
  const createMilestoneStream = useCreateMilestoneStream();

  const [form, setForm] = useState({
    recipient: "",
    mint: "",
    amount: "",
  });

  const errors = useMemo(() => {
    const e: string[] = [];
    if (form.recipient && !isValidPubkey(form.recipient)) e.push("Invalid recipient address");
    if (form.mint && !isValidPubkey(form.mint)) e.push("Invalid token mint address");
    return e;
  }, [form]);

  const canSubmit =
    publicKey &&
    form.recipient &&
    form.mint &&
    form.amount &&
    Number(form.amount) > 0 &&
    errors.length === 0 &&
    !createMilestoneStream.isPending;

  const handleSubmit = () => {
    if (!publicKey) return;
    const mint = new PublicKey(form.mint);
    createMilestoneStream.mutate({
      recipient: new PublicKey(form.recipient),
      milestoneAuthority: publicKey,
      mint,
      amount: Math.round(Number(form.amount) * 10 ** 6),
      senderToken: getAssociatedTokenAddressSync(mint, publicKey, true),
    });
  };

  const resetForm = () => setForm({ recipient: "", mint: "", amount: "" });

  const update = (field: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  if (createMilestoneStream.isSuccess) {
    return (
      <StreamCreationSuccess
        txSignature={createMilestoneStream.data.tx}
        onReset={resetForm}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Recipient Wallet" required>
          <Input
            placeholder="Wallet address"
            value={form.recipient}
            onChange={(e) => update("recipient", e.target.value)}
          />
        </Field>
        <TokenSelector value={form.mint} onChange={(v) => update("mint", v)} />
      </div>

      <Field label="Amount (tokens)" required>
        <Input
          type="number"
          min="0"
          placeholder="1000"
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </Field>

      <p className="text-xs text-muted">
        Milestones are configured after creation. You (the creator) are set as the milestone authority.
      </p>

      {errors.length > 0 && (
        <div className="rounded-md border border-warn/30 bg-warn/5 px-4 py-3">
          <ul className="list-inside list-disc space-y-1 text-sm text-warn">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {createMilestoneStream.isError && (
        <div className="rounded-md border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
          {createMilestoneStream.error instanceof Error
            ? createMilestoneStream.error.message
            : "Transaction failed"}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="default"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1"
        >
          {createMilestoneStream.isPending ? "Confirming..." : "Create Milestone Stream"}
        </Button>
        <Button variant="ghost" onClick={resetForm}>
          Reset
        </Button>
      </div>

      {createMilestoneStream.isPending && (
        <p className="text-center text-xs text-muted">Waiting for wallet approval...</p>
      )}
    </div>
  );
}
