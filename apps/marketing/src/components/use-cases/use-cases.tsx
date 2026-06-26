import { SectionDecorations, BlobBlob } from "@simplyvest/ui/section-decorations";
import { LuUsers, LuTarget, LuUser } from "react-icons/lu";

import type { UseCaseItem } from "./use-case-card";

import { UseCaseCard } from "./use-case-card";

const useCases: UseCaseItem[] = [
  {
    icon: LuUsers,
    number: "01",
    title: "TEAM VESTING",
    description:
      "Distribute tokens to team members with structured vesting schedules. Align long-term incentives with time-locked distributions that auto-release on schedule.",
    features: [
      "Employee token grants",
      "Advisor compensation",
      "Investor allocations",
      "Automated distribution",
    ],
    highlighted: false,
  },
  {
    icon: LuTarget,
    number: "02",
    title: "MILESTONE PAYMENTS",
    description:
      "Release tokens based on verified milestone completion. A designated authority triggers the release — tie unlocks to real-world achievements and on-chain proof.",
    features: [
      "Condition-based releases",
      "Custom milestone criteria",
      "Manual or automated triggers",
      "Flexible unlock logic",
    ],
    highlighted: true,
  },
  {
    icon: LuUser,
    number: "03",
    title: "SELF-VESTING",
    description:
      "Lock your own tokens to prevent impulsive sales. Create a commitment display that builds community trust through transparent personal vesting.",
    features: [
      "Personal token locks",
      "Commitment displays",
      "Community trust building",
      "Disciplined vesting",
    ],
    highlighted: false,
  },
];

export function UseCases() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-24">
      {/* Decorative blurred circles */}
      <SectionDecorations>
        <BlobBlob className="pointer-events-none absolute -left-32 top-1/4 h-64 w-64 bg-purple-200/30 dark:bg-purple-800/30" />
        <BlobBlob className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 bg-violet-200/25 dark:bg-violet-800/25" />
        <BlobBlob className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 bg-purple-100/40 dark:bg-purple-900/40" />
      </SectionDecorations>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
            03
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-5xl">
            Use Cases
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-slate-400">
            From team compensation to milestone-based payments — SimplyVest handles the distribution
            so you can focus on building.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {useCases.map((item) => (
            <UseCaseCard key={item.number} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
