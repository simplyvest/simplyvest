import * as React from "react";
import { Check, Code2, DollarSign, Lock, Shield, Zap } from "lucide-react";

import { cn } from "@/utils/cn";

const features = [
  {
    icon: Lock,
    label: "PDA",
    title: "Vaults",
    description:
      "All tokens secured in program-derived addresses with mathematical guarantees. No admin keys or backdoors.",
  },
  {
    icon: DollarSign,
    label: "SOL",
    title: "Rent Recovery",
    description:
      "Automatic recovery of Solana rent when vesting streams close. No wasted SOL locked in closed accounts.",
  },
  {
    icon: Code2,
    label: "MIT",
    title: "Open Source",
    description:
      "Fully auditable smart contracts published under MIT license. Community-verified and transparently developed.",
  },
  {
    icon: Zap,
    label: "0",
    title: "Protocol Fees",
    description:
      "Zero protocol fees forever. Pay only network transaction costs. No hidden charges or revenue extraction.",
  },
] as const;

const metrics = [
  "Audited Smart Contracts",
  "Non-Custodial Architecture",
  "Community Verified",
];

function FeatureCard({
  feature,
  highlighted,
}: {
  feature: (typeof features)[number];
  highlighted?: boolean;
}) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl p-6",
        highlighted
          ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white"
          : "border border-white/60 bg-white/60 backdrop-blur-sm",
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            highlighted
              ? "bg-white/20 text-white"
              : "bg-gradient-to-br from-purple-600 to-purple-500 text-white",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5">
          {highlighted ? (
            <span className="font-mono text-3xl font-bold">{feature.label}</span>
          ) : (
            <>
              <span
                className={cn(
                  "font-mono text-xs font-medium",
                  highlighted ? "text-white/80" : "text-purple-600",
                )}
              >
                {feature.label}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  highlighted ? "text-white/80" : "text-purple-600",
                )}
              >
                {feature.title}
              </span>
            </>
          )}
        </div>
      </div>

      {highlighted ? (
        <>
          <h3 className="text-2xl font-bold">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-purple-100">
            {feature.description}
          </p>
        </>
      ) : (
        <>
          <div>
            <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-purple-600">
              {feature.label}
            </span>
            <h3 className="mt-1 text-lg font-bold text-gray-900">
              {feature.title}
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            {feature.description}
          </p>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <Check className="h-4 w-4" />
            <span className="text-xs font-medium">Verified</span>
          </div>
        </>
      )}
    </div>
  );
}

export function Security() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white py-24">
      {/* Decorative blurred circles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-purple-100/40 blur-3xl" />
      </div>

      {/* Security grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,51,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Large decorative shield */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <Shield className="h-[600px] w-[600px] text-purple-600 opacity-[0.05]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="border-t border-border pt-14">
          <div className="font-mono text-[0.68rem] uppercase tracking-wide text-dim">
            04
          </div>
          <h2 className="mt-2">Trust &amp; Security</h2>
          <p className="mt-2 max-w-[580px] text-[0.95rem] text-muted">
            Security-first architecture with verifiable guarantees at every
            layer of the protocol.
          </p>
        </div>

        {/* Glassmorphism panel */}
        <div className="mt-12 rounded-3xl border border-white/60 bg-white/60 p-8 shadow-2xl shadow-purple-600/10 backdrop-blur-sm">
          {/* Status bar */}
          <div className="flex flex-wrap items-center gap-4 border-b border-gray-200/60 pb-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-xs font-medium text-emerald-600">
                All Systems Secure
              </span>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 font-mono text-[0.65rem] font-medium text-emerald-700">
              Audited
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-gray-400">
              SECURITY_LEVEL: MAX
            </span>
          </div>

          {/* 2-column feature grid */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <FeatureCard feature={features[0]} />
              <FeatureCard feature={features[1]} />
            </div>
            {/* Right column */}
            <div className="flex flex-col gap-6">
              <FeatureCard feature={features[2]} />
              <FeatureCard feature={features[3]} highlighted />
            </div>
          </div>

          {/* Footer metrics */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-gray-200/60 pt-6">
            {metrics.map((metric) => (
              <div key={metric} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <span className="font-mono text-xs font-medium text-gray-600">
                  {metric}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
