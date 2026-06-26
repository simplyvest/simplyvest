import { LuBrackets, LuDollarSign, LuLock, LuZap } from "react-icons/lu";

import { SecurityDecorations } from "./security-decorations";
import { FeatureCard } from "./security-feature-card";

const features = [
  {
    icon: LuLock,
    label: "PDA",
    title: "Vaults",
    description:
      "All tokens secured in program-derived addresses with mathematical guarantees. No admin keys or backdoors.",
  },
  {
    icon: LuDollarSign,
    label: "SOL",
    title: "Rent Recovery",
    description:
      "Automatic recovery of Solana rent when vesting streams close. No wasted SOL locked in closed accounts.",
  },
  {
    icon: LuBrackets,
    label: "MIT",
    title: "Open Source",
    description:
      "Fully auditable smart contracts published under MIT license. Community-verified and transparently developed.",
  },
  {
    icon: LuZap,
    label: "0",
    title: "Protocol Fees",
    description:
      "Zero protocol fees forever. Pay only network transaction costs. No hidden charges or revenue extraction.",
  },
] as const;

const metrics = ["Audited Smart Contracts", "Non-Custodial Architecture", "Community Verified"];

export function Security() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white py-24 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
      <SecurityDecorations />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="border-t border-border pt-14">
          <div className="font-mono text-[0.68rem] uppercase tracking-wide text-dim">04</div>
          <h2 className="mt-2">Trust &amp; Security</h2>
          <p className="mt-2 max-w-[580px] text-[0.95rem] text-muted">
            Security-first architecture with verifiable guarantees at every layer of the protocol.
          </p>
        </div>

        {/* Glassmorphism panel */}
        <div className="mt-12 rounded-3xl border border-white/60 bg-white/60 p-8 shadow-2xl shadow-purple-600/10 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-purple-400/10">
          {/* Status bar */}
          <div className="flex flex-wrap items-center gap-4 border-b border-gray-200/60 pb-6 dark:border-slate-600/60">
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
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-gray-400 dark:text-slate-500">
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-gray-200/60 pt-6 dark:border-slate-600/60">
            {metrics.map((metric) => (
              <div key={metric} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <span className="font-mono text-xs font-medium text-gray-600 dark:text-slate-300">
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
