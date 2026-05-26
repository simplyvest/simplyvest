import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useMemo } from "react";

import { TokenSelector } from "@/components/tokens/token-selector";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { SelectInput } from "@/components/ui/select-input";
import { TextInput } from "@/components/ui/text-input";
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
  milestoneAuthority: string;
}

const initialForm: FormState = {
  streamType: "time",
  recipient: "",
  mint: "",
  amount: "",
  startTime: "",
  endTime: "",
  cliffTime: "",
  milestoneAuthority: "",
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
    if (
      form.streamType === "milestone" &&
      form.milestoneAuthority &&
      !isValidPubkey(form.milestoneAuthority)
    ) {
      e.push("Invalid milestone authority address");
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
    (form.streamType === "milestone" ? form.milestoneAuthority : form.startTime && form.endTime);

  const handleSubmit = async () => {
    if (!publicKey) return;

    const mint = new PublicKey(form.mint);
    const senderToken = getAssociatedTokenAddressSync(mint, publicKey, true);
    const recipient = new PublicKey(form.recipient);

    if (form.streamType === "milestone") {
      createMilestoneStream.mutate({
        recipient,
        milestoneAuthority: new PublicKey(form.milestoneAuthority),
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
      <FormField label="Stream Type" required>
        <SelectInput value={form.streamType} onChange={(e) => update("streamType", e.target.value)}>
          <option value="time">Time-based Vesting</option>
          <option value="milestone">Milestone-gated</option>
        </SelectInput>
      </FormField>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Recipient Wallet" required>
          <TextInput
            placeholder="Wallet address"
            value={form.recipient}
            onChange={(e) => update("recipient", e.target.value)}
          />
        </FormField>

        <TokenSelector value={form.mint} onChange={(v) => update("mint", v)} />
      </div>

      <FormField label="Amount (tokens)" required>
        <TextInput
          type="number"
          step="any"
          min="0"
          placeholder="1000"
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </FormField>

      {form.streamType === "time" ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField label="Start Date/Time" required>
              <TextInput
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => update("startTime", e.target.value)}
              />
            </FormField>

            <FormField label="End Date/Time" required>
              <TextInput
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => update("endTime", e.target.value)}
              />
            </FormField>

            <FormField label="Cliff Date/Time (optional)">
              <TextInput
                type="datetime-local"
                value={form.cliffTime}
                onChange={(e) => update("cliffTime", e.target.value)}
              />
            </FormField>
          </div>
        </>
      ) : (
        <FormField label="Milestone Authority Wallet" required>
          <TextInput
            placeholder="Wallet address that can trigger the milestone"
            value={form.milestoneAuthority}
            onChange={(e) => update("milestoneAuthority", e.target.value)}
          />
        </FormField>
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
