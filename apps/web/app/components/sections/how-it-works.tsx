import { Download, Lock, Radio } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    number: 1,
    title: "Create Stream",
    icon: Radio,
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
    icon: Lock,
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
    icon: Download,
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
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50/20 to-white py-24 sm:py-32">
      {/* ------------------------------------------------------------------ */}
      {/*  Background decoration                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Blurred circles */}
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute -right-24 top-2/3 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-100/40 blur-3xl" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Content                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-purple-700">
            02
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
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
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-6 py-3 text-sm font-medium text-purple-700 shadow-sm backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
            Ready in minutes, secure forever
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step Card                                                                 */
/* -------------------------------------------------------------------------- */

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <div
      className={cn(
        "relative flex flex-col items-start gap-6 sm:flex-row sm:items-center",
        /* Alternate layout on md+ */
        isEven ? "md:flex-row" : "md:flex-row-reverse",
      )}
    >
      {/* ---- Step number circle (timeline anchor) ---- */}
      <div className="relative z-10 flex shrink-0 items-center sm:left-0 md:absolute md:left-1/2 md:-translate-x-1/2">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-500 text-2xl font-bold text-white shadow-lg md:h-20 md:w-20 md:text-3xl">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-purple-400/40 blur-xl" />
          <span className="relative">{step.number}</span>
        </div>
      </div>

      {/* ---- Card ---- */}
      <div
        className={cn(
          "group relative w-full flex-1 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-purple-200 hover:shadow-md sm:p-8",
          /* Offset on md+ so card doesn't overlap timeline circle */
          "md:w-[calc(50%-2.5rem)]",
          isEven ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8",
        )}
      >
        {/* Hover gradient overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-50/0 to-purple-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Icon badge — top right */}
        <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors duration-300 group-hover:bg-purple-200">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>

        {/* Title + mono label */}
        <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
        <span className="mt-1.5 inline-block rounded-md bg-purple-100 px-2.5 py-0.5 font-mono text-xs text-purple-700">
          {step.label}
        </span>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {step.description}
        </p>

        {/* Details grid */}
        <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {step.details.map((detail) => (
            <li key={detail} className="flex items-start gap-2 text-sm text-text">
              <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
              {detail}
            </li>
          ))}
        </ul>

        {/* Decorative corner */}
        <div className="absolute bottom-3 right-3 h-8 w-8 rounded-bl-2xl border-b border-r border-purple-200/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </div>
  );
}
