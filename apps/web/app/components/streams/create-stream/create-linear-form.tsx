import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useState, useMemo } from "react";

import { TokenSelector } from "@/components/tokens/token-selector/token-selector";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateStream } from "@/hooks/tx/use-create-stream";
import { useAuth } from "@/lib/solana/use-auth";

import { StreamCreationSuccess } from "./stream-creation-success";
import { TimeFields } from "./time-fields";
import { toUnixSec, isValidPubkey } from "./utils";

export function CreateLinearForm() {
  const { publicKey } = useAuth();
  const createStream = useCreateStream();

  const [form, setForm] = useState({
    recipient: "",
    mint: "",
    amount: "",
    startTime: "",
    endTime: "",
  });

  const errors = useMemo(() => {
    const e: string[] = [];
    if (form.recipient && !isValidPubkey(form.recipient)) e.push("Invalid recipient address");
    if (form.mint && !isValidPubkey(form.mint)) e.push("Invalid token mint address");
    const start = toUnixSec(form.startTime);
    const end = toUnixSec(form.endTime);
    if (start && end && end <= start) e.push("End time must be after start time");
    if (start && start <= Math.floor(Date.now() / 1000)) e.push("Start time must be in the future");
    if (end && start && end - start < 60) e.push("Duration must be at least 60 seconds");
    return e;
  }, [form]);

  const canSubmit =
    publicKey &&
    form.recipient &&
    form.mint &&
    form.amount &&
    Number(form.amount) > 0 &&
    form.startTime &&
    form.endTime &&
    errors.length === 0 &&
    !createStream.isPending;

  const handleSubmit = () => {
    if (!publicKey) return;
    const mint = new PublicKey(form.mint);
    const start = toUnixSec(form.startTime);
    createStream.mutate({
      recipient: new PublicKey(form.recipient),
      mint,
      amount: Math.round(Number(form.amount) * 10 ** 6),
      startTime: start,
      endTime: toUnixSec(form.endTime),
      cliffTime: start,
      senderToken: getAssociatedTokenAddressSync(mint, publicKey, true),
    });
  };

  const resetForm = () =>
    setForm({ recipient: "", mint: "", amount: "", startTime: "", endTime: "" });

  const update = (field: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  if (createStream.isSuccess) {
    return (
      <StreamCreationSuccess
        txSignature={createStream.data.tx}
        streamPda={createStream.data.streamPda.toBase58()}
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
        <Field label="Token" required>
          <TokenSelector value={form.mint} onChange={(v) => update("mint", v)} />
        </Field>
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

      <TimeFields
        startTime={form.startTime}
        endTime={form.endTime}
        cliffTime=""
        onStartTimeChange={(v) => update("startTime", v)}
        onEndTimeChange={(v) => update("endTime", v)}
        onCliffTimeChange={() => {}}
      />

      {errors.length > 0 && (
        <div className="rounded-md border border-warn/30 bg-warn/5 px-4 py-3">
          <ul className="list-inside list-disc space-y-1 text-sm text-warn">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {createStream.isError && (
        <div className="rounded-md border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
          {createStream.error instanceof Error ? createStream.error.message : "Transaction failed"}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="default" onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
          {createStream.isPending ? "Confirming..." : "Create Linear Stream"}
        </Button>
        <Button variant="ghost" onClick={resetForm}>
          Reset
        </Button>
      </div>

      {createStream.isPending && (
        <p className="text-center text-xs text-muted">Waiting for wallet approval...</p>
      )}
    </div>
  );
}
