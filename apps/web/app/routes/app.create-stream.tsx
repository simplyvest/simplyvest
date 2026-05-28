import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { createRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { TokenSelector } from "@/components/ui/token-selector";
import idl from "@/idl/solana_tdp.json";
import type { SolanaTdp } from "@/idl/solana_tdp.types";
import { findCreatorConfigPDA, findStreamPDA, findVaultPDA } from "@/utils/pdas";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/app/create-stream",
  component: CreateStreamPage,
});

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

function findAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

function dateToTimestamp(dateStr: string): number {
  return Math.floor(new Date(dateStr + "T00:00:00.000Z").getTime() / 1000);
}

function todayStr(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function minEndDate(startDate: string): string {
  if (!startDate) return todayStr();
  const start = new Date(startDate + "T00:00:00.000Z");
  const minEnd = new Date(start.getTime() + 60_000);
  return minEnd.toISOString().slice(0, 10);
}

function CreateStreamPage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [form, setForm] = React.useState({
    mint: "",
    recipient: "",
    amount: "",
    startDate: "",
    endDate: "",
    cliffDate: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sending, setSending] = React.useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!form.mint) errs.mint = "Token is required";
    else if (!PublicKey.isOnCurve(form.mint)) {
      errs.mint = "Invalid token mint address";
    }

    if (!form.recipient) errs.recipient = "Recipient wallet is required";
    else if (!PublicKey.isOnCurve(form.recipient)) {
      errs.recipient = "Invalid Solana address";
    }

    if (!form.amount || Number(form.amount) <= 0) errs.amount = "Amount must be greater than 0";

    if (!form.startDate) errs.startDate = "Start date is required";
    else {
      const startTs = dateToTimestamp(form.startDate);
      const now = Math.floor(Date.now() / 1000);
      if (startTs <= now) errs.startDate = "Start date must be in the future";
    }

    if (!form.endDate) errs.endDate = "End date is required";
    else if (form.startDate) {
      const startTs = dateToTimestamp(form.startDate);
      const endTs = dateToTimestamp(form.endDate);
      if (endTs <= startTs) errs.endDate = "End date must be after start date";
      else if (endTs - startTs < 60) errs.endDate = "Duration must be at least 60 seconds";
    }

    if (form.cliffDate) {
      if (!form.startDate || !form.endDate) {
        errs.cliffDate = "Set start and end dates first";
      } else {
        const startTs = dateToTimestamp(form.startDate);
        const endTs = dateToTimestamp(form.endDate);
        const cliffTs = dateToTimestamp(form.cliffDate);
        if (cliffTs < startTs || cliffTs > endTs)
          errs.cliffDate = "Cliff must be between start and end date";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (!wallet || !publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    setSending(true);

    try {
      const provider = new anchor.AnchorProvider(connection, wallet, {});
      const program = new anchor.Program<SolanaTdp>(idl as SolanaTdp, provider);

      const mint = new PublicKey(form.mint);
      const recipient = new PublicKey(form.recipient);
      const amount = Math.floor(Number(form.amount));

      const [creatorConfigPDA] = findCreatorConfigPDA(publicKey);

      let vestingCount: anchor.BN;
      try {
        const config = await program.account.creatorConfig.fetch(creatorConfigPDA);
        vestingCount = config.vestingCount;
      } catch {
        vestingCount = new anchor.BN(0);
      }

      const vestingCountBytes = Uint8Array.from(vestingCount.toArrayLike(Buffer, "le", 8));
      const [streamPDA] = findStreamPDA(publicKey, recipient, mint, vestingCountBytes);
      const [vaultPDA] = findVaultPDA(streamPDA);

      const senderToken = findAssociatedTokenAddress(publicKey, mint);

      const startTime = dateToTimestamp(form.startDate);
      const endTime = dateToTimestamp(form.endDate);
      const cliffTime = form.cliffDate ? dateToTimestamp(form.cliffDate) : 0;

      const txSig = await program.methods
        .createStream({
          amount: new anchor.BN(amount),
          startTime: new anchor.BN(startTime),
          endTime: new anchor.BN(endTime),
          cliffTime: new anchor.BN(cliffTime),
        })
        .accountsPartial({
          sender: publicKey,
          recipient,
          creatorConfig: creatorConfigPDA,
          stream: streamPDA,
          vault: vaultPDA,
          senderToken,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      toast.success("Stream created successfully!", {
        description: `Transaction: ${txSig.slice(0, 8)}...${txSig.slice(-4)}`,
      });

      setForm({
        mint: "",
        recipient: "",
        amount: "",
        startDate: "",
        endDate: "",
        cliffDate: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      toast.error("Failed to create stream", { description: msg });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-28">
      <Badge variant="sol">Create Stream</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        New <em>Vesting Stream</em>
      </h1>
      <p className="mt-2 max-w-lg text-muted">
        Create a time-based vesting stream. Tokens are transferred to a vault and released linearly
        to the recipient over the specified period.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 rounded-xl border border-border bg-bg1 px-8 py-8"
      >
        <div className="grid gap-6">
          <FormField label="Token" required>
            <TokenSelector
              value={form.mint}
              onChange={(mint) => setForm((prev) => ({ ...prev, mint }))}
            />
            {errors.mint && <p className="text-xs text-warn">{errors.mint}</p>}
          </FormField>

          <FormField label="Recipient Wallet Address" required>
            <TextInput
              type="text"
              name="recipient"
              value={form.recipient}
              onChange={handleChange}
              placeholder="Enter recipient's Solana address"
            />
            {errors.recipient && <p className="text-xs text-warn">{errors.recipient}</p>}
          </FormField>

          <FormField label="Amount" required>
            <TextInput
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0"
              step="any"
              placeholder="1000"
            />
            {errors.amount && <p className="text-xs text-warn">{errors.amount}</p>}
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Start Date" required>
              <DateInput
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                min={todayStr()}
              />
              {errors.startDate && <p className="text-xs text-warn">{errors.startDate}</p>}
            </FormField>

            <FormField label="End Date" required>
              <DateInput
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={minEndDate(form.startDate)}
              />
              {errors.endDate && <p className="text-xs text-warn">{errors.endDate}</p>}
            </FormField>
          </div>

          <FormField label="Cliff Date (optional)">
            <DateInput
              name="cliffDate"
              value={form.cliffDate}
              onChange={handleChange}
              min={form.startDate || todayStr()}
              max={form.endDate || undefined}
            />
            <p className="text-xs text-dim">If set, no tokens are withdrawable until this date.</p>
            {errors.cliffDate && <p className="text-xs text-warn">{errors.cliffDate}</p>}
          </FormField>
        </div>

        <div className="mt-8">
          <Button type="submit" disabled={sending || !wallet} size="lg" className="w-full">
            {sending
              ? "Creating Stream..."
              : !wallet
                ? "Connect Wallet to Create"
                : "Create Stream"}
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted">* Required fields</p>
      </form>

      <div className="h-16" />
    </div>
  );
}
