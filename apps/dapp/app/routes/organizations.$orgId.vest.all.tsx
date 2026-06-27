import { Button } from "@simplyvest/ui/button";
import { Field } from "@simplyvest/ui/field";
import { Input } from "@simplyvest/ui/input";
import { PublicKey } from "@solana/web3.js";
import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { LuArrowLeft, LuCheck, LuChevronLeft, LuX } from "react-icons/lu";

import type { EligibleMember } from "@/components/orgs/member-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useBatchCreateStreams } from "@/hooks/tx/use-batch-create-streams";
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

type Step = "pool" | "params" | "confirm" | "executing" | "summary";

export const Route = createRoute({
  getParentRoute: () => OrganizationsOrgIdVestRoute,
  path: "/all",
  component: AllVestPage,
});

function AllVestPage() {
  const { orgId } = Route.useParams();
  const navigate = useNavigate();
  const { data: org } = useOrg(orgId);
  const { publicKey } = useAuth();
  const batchCreate = useBatchCreateStreams();

  const [step, setStep] = useState<Step>("pool");
  const [poolAmount, setPoolAmount] = useState("");
  const [scheduleLater, setScheduleLater] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [durationIdx, setDurationIdx] = useState(3);
  const [cliffIdx, setCliffIdx] = useState(0);

  const tokenSymbol = org?.tokenSymbol ?? "tokens";
  const tokenDecimals = org?.tokenDecimals ?? 9;
  const mintAddress = org?.mintAddress ?? "";

  const eligibleMembers: EligibleMember[] = (org?.members ?? []).filter(
    (m): m is EligibleMember => m.role !== "owner" && typeof m.walletAddress === "string",
  );

  const memberCount = eligibleMembers.length;

  const perMemberAmount = useMemo(() => {
    if (!poolAmount || memberCount === 0) return 0;
    const pool = Number(poolAmount);
    if (pool <= 0) return 0;
    const perMember = Math.floor(pool / memberCount);
    return perMember;
  }, [poolAmount, memberCount]);

  const totalVested = perMemberAmount * memberCount;
  const remainder = Number(poolAmount) - totalVested;
  const remainderNote =
    remainder > 0 ? `${remainder.toLocaleString()} ${tokenSymbol} remaining (not vested)` : null;

  const poolRaw = Math.round(perMemberAmount * 10 ** tokenDecimals);

  const canSubmitPool = publicKey && poolAmount && Number(poolAmount) > 0 && memberCount > 0;
  const canExecute = canSubmitPool && perMemberAmount > 0;

  function getStartUnix(): number {
    const now = Math.floor(Date.now() / 1000) + 120;
    if (scheduleLater && startTime) {
      const parsed = new Date(startTime).getTime() / 1000;
      return Math.max(parsed, now);
    }
    return now;
  }

  function handleExecute() {
    if (!publicKey || !mintAddress || memberCount === 0 || perMemberAmount <= 0) return;

    const mint = new PublicKey(mintAddress);
    const start = getStartUnix();
    const duration = DURATION_OPTIONS[durationIdx].seconds;
    const cliff = CLIFF_OPTIONS[cliffIdx].seconds;

    setStep("executing");

    batchCreate.mutate(
      {
        members: eligibleMembers.map((m) => ({
          recipient: new PublicKey(m.walletAddress),
          amount: poolRaw,
        })),
        mint,
        startTime: start,
        endTime: start + duration,
        cliffTime: cliff > 0 ? start + cliff : start,
        orgId,
      },
      { onSettled: () => setStep("summary") },
    );
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
        <h1 className="text-2xl font-bold tracking-tight text-text">Vest to All Members</h1>
        <p className="mt-1 text-sm text-muted">
          Share a pool of {tokenSymbol} equally across eligible members
        </p>
      </div>

      {step === "pool" && (
        <div className="space-y-5">
          <Field label={`Total pool (${tokenSymbol})`} required>
            <Input
              type="number"
              min="0"
              placeholder="500000"
              value={poolAmount}
              onChange={(e) => setPoolAmount(e.target.value)}
            />
          </Field>

          {poolAmount && Number(poolAmount) > 0 && (
            <div className="rounded-lg border border-border bg-bg1 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Eligible members</span>
                <span className="text-text font-medium">{memberCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Each member gets</span>
                <span className="text-text font-medium">
                  {perMemberAmount.toLocaleString()} {tokenSymbol}
                </span>
              </div>
              {memberCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total vested</span>
                  <span className="text-text font-medium">
                    {totalVested.toLocaleString()} {tokenSymbol}
                  </span>
                </div>
              )}
              {remainderNote && (
                <p className="text-xs text-dim pt-1 border-t border-border">{remainderNote}</p>
              )}
            </div>
          )}

          {memberCount === 0 && (
            <div className="rounded-lg border border-border bg-bg1 p-4 text-center">
              <p className="text-sm text-muted">No eligible members with wallet addresses</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button disabled={!canSubmitPool} onClick={() => setStep("params")}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === "params" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-bg1 p-4 space-y-1">
            <p className="text-sm text-muted">
              Pool: {Number(poolAmount).toLocaleString()} {tokenSymbol}
            </p>
            <p className="text-sm text-muted">
              Each member: {perMemberAmount.toLocaleString()} {tokenSymbol}
            </p>
          </div>

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

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("pool")}>
              <LuChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep("confirm")}>Next: Review</Button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between bg-bg2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <span className="flex-1">Member</span>
              <span className="w-28 text-right">Amount</span>
            </div>
            {eligibleMembers.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between border-t border-border px-4 py-3"
              >
                <span className="flex-1 text-sm text-text truncate">
                  {m.displayName ?? `${m.walletAddress.slice(0, 6)}...${m.walletAddress.slice(-4)}`}
                </span>
                <span className="w-28 text-right text-sm text-text font-mono">
                  {perMemberAmount.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border bg-bg2 px-4 py-2.5 text-sm font-medium text-text">
              <span>Total</span>
              <span className="font-mono">
                {totalVested.toLocaleString()} {tokenSymbol}
              </span>
            </div>
          </div>

          {remainderNote && <p className="text-xs text-dim">{remainderNote}</p>}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("params")}>
              <LuChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleExecute} disabled={!canExecute}>
              Confirm & Execute
            </Button>
          </div>
        </div>
      )}

      {step === "executing" && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-bg1 px-8 py-12 text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted">
            Creating {memberCount} stream{memberCount !== 1 ? "s" : ""}...
          </p>
          <p className="text-xs text-dim">Please confirm the transactions in your wallet</p>
        </div>
      )}

      {step === "summary" && (
        <div className="space-y-5">
          {batchCreate.data && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between bg-bg2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <span className="flex-1">Member</span>
                <span className="w-20 text-right">Status</span>
              </div>

              {batchCreate.data.success.map((s) => {
                const member = eligibleMembers.find((m) => m.walletAddress === s.recipient);
                return (
                  <div
                    key={s.recipient}
                    className="flex items-center justify-between border-t border-border px-4 py-3"
                  >
                    <span className="flex-1 text-sm text-text truncate">
                      {member?.displayName ?? `${s.recipient.slice(0, 6)}...`}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-success">
                      <LuCheck className="h-4 w-4" />
                      Created
                    </span>
                  </div>
                );
              })}

              {batchCreate.data.failed.map((f) => {
                const member = eligibleMembers.find((m) => m.walletAddress === f.recipient);
                return (
                  <div
                    key={f.recipient}
                    className="flex items-center justify-between border-t border-border px-4 py-3"
                  >
                    <span className="flex-1 text-sm text-text truncate">
                      {member?.displayName ?? `${f.recipient.slice(0, 6)}...`}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-warn">
                      <LuX className="h-4 w-4" />
                      Failed
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {batchCreate.data?.success.length === memberCount && (
            <div className="flex flex-col items-center rounded-lg border border-success/30 bg-success/5 px-4 py-6 text-center">
              <div className="rounded-full bg-success/10 p-2 mb-2">
                <LuCheck className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-semibold text-text">
                All {memberCount} stream{memberCount !== 1 ? "s" : ""} created
              </p>
            </div>
          )}

          {batchCreate.data && batchCreate.data.failed.length > 0 && (
            <div className="rounded-lg border border-warn/30 bg-warn/5 px-4 py-4">
              <p className="text-sm font-medium text-warn">
                {batchCreate.data.failed.length} stream
                {batchCreate.data.failed.length !== 1 ? "s" : ""} failed
              </p>
              {batchCreate.data.failed.map((f) => (
                <p key={f.recipient} className="mt-1 text-xs text-warn/80">
                  {f.recipient.slice(0, 6)}...: {f.error}
                </p>
              ))}
            </div>
          )}

          {batchCreate.isError && (
            <div className="rounded-lg border border-warn/30 bg-warn/5 px-4 py-4 text-sm text-warn">
              {batchCreate.error instanceof Error
                ? batchCreate.error.message
                : "Batch creation failed"}
            </div>
          )}

          <div className="flex justify-center">
            <Button onClick={() => navigate({ to: "/organizations/$orgId", params: { orgId } })}>
              Back to Organization
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
