import { LuBrackets, LuDollarSign, LuLock, LuZap } from "react-icons/lu";

import { Reveal } from "../reveal";
import { SECTION_PADDING, SectionHeader } from "../section-header";
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
      "Automatic recovery of Solana rent when vesting grants close. No wasted SOL locked in closed accounts.",
  },
  {
    icon: LuBrackets,
    label: "MIT",
    title: "Open Source",
    description:
      "Open-source smart contracts under the MIT license. Fully auditable and transparently developed.",
  },
  {
    icon: LuZap,
    label: "0",
    title: "Protocol Fees",
    description:
      "Zero protocol fees forever. Pay only network transaction costs. No hidden charges or revenue extraction.",
  },
] as const;

const metrics = ["Open Source (MIT)", "Non-Custodial Architecture", "Security Test Suite"];

export function Security() {
  return (
    <section
      id="security"
      className={`relative overflow-hidden ${SECTION_PADDING} bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950`}
    >
      <SecurityDecorations />

      <div className="relative mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="border-t border-border pt-14">
            <SectionHeader
              number="04"
              title="Trust & Security"
              description="Security-first architecture — web2-speed queries with on-chain settlement guarantees at every layer."
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 rounded-3xl border border-white/60 bg-white/60 p-8 shadow-2xl shadow-purple-600/10 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-purple-400/10">
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-200/60 pb-6 dark:border-slate-600/60">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-xs font-medium text-emerald-600">
                  Non-custodial by design
                </span>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 font-mono text-[0.65rem] font-medium text-emerald-700">
                Open source (MIT)
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
              {features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-gray-200/60 pt-6 dark:border-slate-600/60">
              {metrics.map((metric) => (
                <div key={metric} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-xs font-medium text-muted">{metric}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
