import { Button } from "@simplyvest/ui/button";
import { Field } from "@simplyvest/ui/field";
import { Input } from "@simplyvest/ui/input";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { LuArrowLeft, LuCheck, LuChevronLeft } from "react-icons/lu";

import { MemberPicker, type EligibleMember } from "@/components/orgs/member-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useCreateStream } from "@/hooks/tx/use-create-stream";
import { useOrg } from "@/hooks/use-org-api";
import { useAuth } from "@/lib/solana/use-auth";

import { Route as OrganizationsOrgIdVestRoute } from "./organizations.$orgId.vest";

const DURATION_OPTIONS = [
  { label: "1 year", seconds: 365 * 24 * 60 * 60 },
  { label: "2 years", seconds: 2 * 365 * 24 * 60 * 60 },
  { label: "3 years", seconds: 3 * 365 * 24 * 60 * 60 },
  { label: "4 years", seconds: 4 * 365 * 24 * 60 * 60 },
];

const CLIFF_OPTIONS = [
  { label: "No cliff", seconds: 0 },
  { label: "3 months", seconds: 90 * 24 * 60 * 60 },
  { label: "6 months", seconds: 180 * 24 * 60 * 60 },
  { label: "1 year", seconds: 365 * 24 * 60 * 60 },
];

type Step = "pick" | "confirm" | "form" | "success";

export const Route = createRoute({
  getParentRoute: () => OrganizationsOrgIdVestRoute,
  path: "/individual",
  component: IndividualVestPage,
});

function IndividualVestPage() {
  const { orgId } = Route.useParams();
  const navigate = useNavigate();
  const { data: org } = useOrg(orgId);
  const { publicKey } = useAuth();
  const createStream = useCreateStream();

  const [step, setStep] = useState<Step>("pick");
  const [selectedMember, setSelectedMember] = useState<EligibleMember | null>(null);
  const [amount, setAmount] = useState("");
  const [scheduleLater, setScheduleLater] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [durationIdx, setDurationIdx] = useState(3);
  const [cliffIdx, setCliffIdx] = useState(0);

  const eligibleMembers: EligibleMember[] = (org?.members ?? []).filter(
    (m): m is EligibleMember => m.role !== "owner" && typeof m.walletAddress === "string",
  );

  const tokenSymbol = org?.tokenSymbol ?? "tokens";
  const tokenDecimals = org?.tokenDecimals ?? 9;
  const mintAddress = org?.mintAddress ?? "";

  const errors = useMemo(() => {
    const e: string[] = [];
    if (amount && Number(amount) <= 0) e.push("Amount must be greater than 0");
    return e;
  }, [amount]);

  const canSubmit =
    publicKey && amount && Number(amount) > 0 && errors.length === 0 && !createStream.isPending;

  function getStartUnix(): number {
    const now = Math.floor(Date.now() / 1000) + 120;
    if (scheduleLater && startTime) {
      const parsed = new Date(startTime).getTime() / 1000;
      return Math.max(parsed, now);
    }
    return now;
  }

  function handleFormSubmit() {
    if (!publicKey || !selectedMember || !canSubmit) return;

    const mint = new PublicKey(mintAddress);
    const start = getStartUnix();
    const duration = DURATION_OPTIONS[durationIdx].seconds;
    const cliff = CLIFF_OPTIONS[cliffIdx].seconds;

    createStream.mutate(
      {
        recipient: new PublicKey(selectedMember.walletAddress),
        mint,
        amount: Math.round(Number(amount) * 10 ** tokenDecimals),
        startTime: start,
        endTime: start + duration,
        cliffTime: cliff > 0 ? start + cliff : start,
        senderToken: getAssociatedTokenAddressSync(mint, publicKey, true),
        orgId,
      },
      { onSuccess: () => setStep("success") },
    );
  }

  function handleReset() {
    setStep("pick");
    setSelectedMember(null);
    setAmount("");
    setScheduleLater(false);
    setStartTime("");
    setDurationIdx(3);
    setCliffIdx(0);
    createStream.reset();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/organizations/$orgId/vest"
          params={{ orgId }}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text no-underline hover:no-underline mb-4"
        >
          <LuArrowLeft className="h-3.5 w-3.5" />
          Back to vest options
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text">Vest to Individual</h1>
        <p className="mt-1 text-sm text-muted">Select a member and set their vesting schedule</p>
      </div>

      {step === "pick" && (
        <div className="space-y-4">
          <MemberPicker
            members={eligibleMembers}
            value={selectedMember?.userId ?? null}
            onChange={setSelectedMember}
          />
          <div className="flex justify-end">
            <Button disabled={!selectedMember} onClick={() => selectedMember && setStep("confirm")}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && selectedMember && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-bg1 p-4">
            <p className="text-xs text-muted mb-1">Recipient</p>
            <p className="text-sm font-medium text-text">
              {selectedMember.displayName ?? "Member"}
            </p>
            <p className="text-xs text-dim font-mono mt-0.5">{selectedMember.walletAddress}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("pick")}>
              <LuChevronLeft className="h-4 w-4" />
              Change
            </Button>
            <Button onClick={() => setStep("form")}>
              <LuCheck className="h-4 w-4" />
              Confirm
            </Button>
          </div>
        </div>
      )}

      {step === "form" && (
        <div className="space-y-5">
          <Field label={`Amount (${tokenSymbol})`} required>
            <Input
              type="number"
              min="0"
              placeholder="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Start</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input
                  type="radio"
                  name="start"
                  checked={!scheduleLater}
                  onChange={() => setScheduleLater(false)}
                  className="accent-primary"
                />
                Now
              </label>
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input
                  type="radio"
                  name="start"
                  checked={scheduleLater}
                  onChange={() => setScheduleLater(true)}
                  className="accent-primary"
                />
                Schedule
              </label>
            </div>
            {scheduleLater && (
              <div className="mt-2">
                <DateTimePicker
                  value={startTime}
                  onChange={setStartTime}
                  placeholder="Select start date"
                  disablePast
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Duration</label>
            <select
              className="flex h-10 w-full rounded-lg border border-border2 bg-bg2 px-3.5 text-sm"
              value={durationIdx}
              onChange={(e) => setDurationIdx(Number(e.target.value))}
            >
              {DURATION_OPTIONS.map((opt, i) => (
                <option key={opt.label} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Cliff</label>
            <select
              className="flex h-10 w-full rounded-lg border border-border2 bg-bg2 px-3.5 text-sm"
              value={cliffIdx}
              onChange={(e) => setCliffIdx(Number(e.target.value))}
            >
              {CLIFF_OPTIONS.map((opt, i) => (
                <option key={opt.label} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

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
              {createStream.error instanceof Error
                ? createStream.error.message
                : "Transaction failed"}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("confirm")}>
              <LuChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleFormSubmit} disabled={!canSubmit}>
              {createStream.isPending ? "Confirming..." : "Create Vest"}
            </Button>
          </div>

          {createStream.isPending && (
            <p className="text-center text-xs text-muted">Waiting for wallet approval...</p>
          )}
        </div>
      )}

      {step === "success" && createStream.data && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-success/30 bg-success/5 px-8 py-12 text-center space-y-4">
          <div className="rounded-full bg-success/10 p-3">
            <LuCheck className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text">Vest Created</p>
            <p className="mt-1 text-sm text-muted">
              {amount} {tokenSymbol} to{" "}
              {selectedMember?.displayName ?? selectedMember?.walletAddress.slice(0, 6)}
            </p>
            <a
              href={`https://explorer.solana.com/tx/${createStream.data.tx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-primary hover:underline font-mono"
            >
              {createStream.data.tx.slice(0, 16)}...
            </a>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset}>
              Create Another
            </Button>
            <Button onClick={() => navigate({ to: "/organizations/$orgId", params: { orgId } })}>
              Back to Organization
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
