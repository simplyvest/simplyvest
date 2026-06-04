import * as React from "react";
import { LuDownload, LuLock, LuRadio } from "react-icons/lu";

import { StepCard } from "@/components/marketing/how-it-works/step-card";
import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    number: 1,
    title: "Create Stream",
    icon: LuRadio,
    label: "initialize_vesting()",
    description:
      "Define your vesting parameters in a single transaction. Set cliffs, duration, and unlock logic — all encoded on-chain.",
    details: [
      "Set vesting duration and unlock schedule",
      "Define cliff periods if needed",
      "Choose linear or milestone-based",
      "Specify recipient wallet address",
    ],
  },
  {
    number: 2,
    title: "Tokens Lock",
    icon: LuLock,
    label: "deposit_to_vault()",
    description:
      "Tokens move into a program-owned PDA vault. Once deposited, the smart contract is the sole authority — no admin keys, no backdoors.",
    details: [
      "Tokens secured in PDA vault",
      "Smart contract enforces schedule",
      "Transparent on-chain verification",
      "No admin backdoors or overrides",
    ],
  },
  {
    number: 3,
    title: "Claim Unlocked",
    icon: LuDownload,
    label: "withdraw_vested()",
    description:
      "Recipients claim tokens as they vest. The program calculates entitlement in real time — partial withdrawals and batch claims included.",
    details: [
      "Claim tokens as they unlock",
      "Partial withdrawals allowed",
      "Real-time vesting calculations",
      "Gas-efficient batch claims",
    ],
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 py-24 sm:py-32">
      {/*  Background decoration                                             */}
      {/* ------------------------------------------------------------------ */}
      <SectionDecorations>
        {/* Blurred circles */}
        <BlobBlob className="absolute -left-32 top-1/4 h-96 w-96 bg-purple-200/30 dark:bg-purple-800/30" />
        <BlobBlob className="absolute -right-24 top-2/3 h-80 w-80 bg-purple-300/20" />
        <BlobBlob className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 bg-purple-100/40 dark:bg-purple-900/40" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </SectionDecorations>

      {/* ------------------------------------------------------------------ */}
      {/*  Content                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            02
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted">
            Three simple steps to create and manage token vesting on Solana.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Timeline                                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative mt-16">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-300 via-purple-400 to-purple-300 sm:left-10 md:left-1/2 md:-translate-x-px" />

          <div className="flex flex-col gap-16">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Bottom CTA                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-20 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-6 py-3 text-sm font-medium text-purple-700 shadow-sm dark:bg-slate-900/80 dark:text-purple-300 backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
            Ready in minutes, secure forever
          </div>
        </div>
      </div>
    </section>
  );
}
