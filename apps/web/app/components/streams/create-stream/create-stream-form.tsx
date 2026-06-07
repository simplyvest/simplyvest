import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useAuth } from "@/lib/solana/use-auth";
import { PublicKey } from "@solana/web3.js";
import { useState, useMemo } from "react";

import { TokenSelector } from "@/components/tokens/token-selector/token-selector";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateStream } from "@/hooks/tx/use-create-stream";
import { useCreateMilestoneStream } from "@/hooks/tx/use-create-milestone-stream";

import { StreamCreationSuccess } from "./stream-creation-success";
import { StreamTypeToggle } from "./stream-type-toggle";
import { TimeFields } from "./time-fields";
import { toUnixSec, isValidPubkey } from "./utils";

type StreamType = "time" | "milestone";

interface FormState {
  streamType: StreamType;
  recipient: string;
  mint: string;
  amount: string;
  startTime: string;
  endTime: string;
  cliffTime: string;
}

const initialForm: FormState = {
  streamType: "time",
  recipient: "",
  mint: "",
  amount: "",
  startTime: "",
  endTime: "",
  cliffTime: "",
};

export function CreateStreamForm() {
  const { publicKey } = useAuth();
  const createStream = useCreateStream();
  const createMilestoneStream = useCreateMilestoneStream();
  const isPending = createStream.isPending || createMilestoneStream.isPending;

  const [form, setForm] = useState<FormState>(initialForm);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (form.recipient && !isValidPubkey(form.recipient)) e.push("Invalid recipient address");
    if (form.mint && !isValidPubkey(form.mint)) e.push("Invalid token mint address");
    if (form.streamType === "time") {
      const start = toUnixSec(form.startTime);
      const end = toUnixSec(form.endTime);
      if (start && end && end <= start) e.push("End time must be after start time");
      if (start && start <= Math.floor(Date.now() / 1000))
        e.push("Start time must be in the future");
      if (end && start && end - start < 60) e.push("Duration must be at least 60 seconds");
    }
    return e;
  }, [form]);

  const canSubmit =
    publicKey &&
    form.recipient &&
    form.mint &&
    form.amount &&
    Number(form.amount) > 0 &&
    errors.length === 0 &&
    !isPending &&
    (form.streamType === "milestone" || (form.startTime && form.endTime));

  const handleSubmit = async () => {
    if (!publicKey) return;

    const mint = new PublicKey(form.mint);
    const senderToken = getAssociatedTokenAddressSync(mint, publicKey, true);
    const recipient = new PublicKey(form.recipient);

    if (form.streamType === "milestone") {
      createMilestoneStream.mutate({
        recipient,
        milestoneAuthority: publicKey,
        mint,
        amount: Math.round(Number(form.amount) * 10 ** 6),
        senderToken,
      });
    } else {
      const start = toUnixSec(form.startTime);
      createStream.mutate({
        recipient,
        mint,
        amount: Math.round(Number(form.amount) * 10 ** 6),
        startTime: start,
        endTime: toUnixSec(form.endTime),
        cliffTime: form.cliffTime ? toUnixSec(form.cliffTime) : start,
        senderToken,
      });
    }
  };

  const resetForm = () => setForm(initialForm);

  const update = (field: keyof FormState, val: string) => setForm((f) => ({ ...f, [field]: val }));

  if (createStream.isSuccess || createMilestoneStream.isSuccess) {
    const txSignature = createStream.isSuccess
      ? createStream.data.tx
      : (createMilestoneStream.data?.tx ?? "");
    return <StreamCreationSuccess txSignature={txSignature} onReset={resetForm} />;
  }

  return (
    <div className="space-y-5">
      <Field label="Stream Type" required>
        <StreamTypeToggle streamType={form.streamType} onChange={(t) => update("streamType", t)} />
      </Field>

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

      {form.streamType === "time" && (
        <TimeFields
          startTime={form.startTime}
          endTime={form.endTime}
          cliffTime={form.cliffTime}
          onStartTimeChange={(v) => update("startTime", v)}
          onEndTimeChange={(v) => update("endTime", v)}
          onCliffTimeChange={(v) => update("cliffTime", v)}
        />
      )}
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
          {isPending
            ? "Confirming..."
            : form.streamType === "time"
              ? "Create Stream"
              : "Create Milestone Stream"}
        </Button>
        <Button variant="ghost" onClick={resetForm}>
          Reset
        </Button>
      </div>

      {isPending && (
        <p className="text-center text-xs text-muted">Waiting for wallet approval...</p>
      )}
    </div>
  );
}
