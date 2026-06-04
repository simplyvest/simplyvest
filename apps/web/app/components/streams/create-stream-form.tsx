import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useMemo } from "react";

import { TokenSelector } from "@/components/tokens/token-selector";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateStream, useCreateMilestoneStream } from "@/hooks/use-transactions";

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

function toUnixSec(datetimeLocal: string): number {
  if (!datetimeLocal) return 0;
  const d = new Date(datetimeLocal);
  return Math.floor(d.getTime() / 1000);
}

function isValidPubkey(s: string): boolean {
  try {
    return !!new PublicKey(s);
  } catch {
    return false;
  }
}

export function CreateStreamForm() {
  const { publicKey } = useWallet();
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

  const resetForm = () => {
    setForm(initialForm);
    createStream.reset();
    createMilestoneStream.reset();
  };

  const update = (field: keyof FormState, val: string) => setForm((f) => ({ ...f, [field]: val }));

  if (createStream.isSuccess || createMilestoneStream.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-sol2/30 bg-sol2/5 px-8 py-12 text-center">
        <p className="text-lg font-semibold text-sol2">Stream Created!</p>
        <p className="mt-1 text-sm text-muted">
          Transaction:{" "}
          {createStream.isSuccess
            ? createStream.data.slice(0, 16) + "..."
            : (createMilestoneStream.data ?? "").slice(0, 16) + "..."}
        </p>
        <Button variant="outline" className="mt-4" onClick={resetForm}>
          Create Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Field label="Stream Type" required>
        <div className="flex rounded-lg border border-border bg-bg1 p-0.5">
          {(["time", "milestone"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update("streamType", t)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                form.streamType === t ? "bg-sol text-white shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              {t === "time" ? "Time-based Vesting" : "Milestone-gated"}
            </button>
          ))}
        </div>
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
          step="any"
          min="0"
          placeholder="1000"
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </Field>

      {form.streamType === "time" ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Start Date/Time" required>
              <Input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => update("startTime", e.target.value)}
              />
            </Field>

            <Field label="End Date/Time" required>
              <Input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => update("endTime", e.target.value)}
              />
            </Field>

            <Field label="Cliff Date/Time (optional)">
              <Input
                type="datetime-local"
                value={form.cliffTime}
                onChange={(e) => update("cliffTime", e.target.value)}
              />
            </Field>
          </div>
        </>
      ) : null}

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
