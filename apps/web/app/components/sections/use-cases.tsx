import * as React from "react";
import { LuUsers, LuTarget, LuUser } from "react-icons/lu";

import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";
import { cn } from "@/utils/cn";

const useCases = [
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

function DecorativeDots() {
  return (
    <svg
      className="absolute right-5 top-5 h-4 w-4 text-purple-300/60 dark:text-purple-400/60"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="8" cy="2" r="1.5" />
      <circle cx="14" cy="2" r="1.5" />
    </svg>
  );
}

function BottomCircles() {
  return (
    <svg
      className="absolute bottom-4 left-1/2 h-6 w-16 -translate-x-1/2 text-purple-200/40 dark:text-purple-400/40"
      viewBox="0 0 64 24"
      fill="currentColor"
    >
      <circle cx="8" cy="12" r="3" />
      <circle cx="20" cy="12" r="3" />
      <circle cx="32" cy="12" r="3" />
      <circle cx="44" cy="12" r="3" />
      <circle cx="56" cy="12" r="3" />
    </svg>
  );
}

function UseCaseCard({ item }: { item: (typeof useCases)[number] }) {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "group relative rounded-[28px] border bg-white dark:bg-slate-900 p-8 transition-all duration-300",
        item.highlighted
          ? "border-purple-300 dark:border-purple-700 shadow-lg md:-mt-4 md:mb-4"
          : "border-gray-200 dark:border-slate-600 shadow-sm hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md",
      )}
    >
      {/* Glow effect behind card */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 rounded-[28px] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
          item.highlighted
            ? "bg-gradient-to-br from-purple-200/60 dark:from-purple-800/60 to-violet-300/40 dark:to-violet-700/40 opacity-60"
            : "bg-gradient-to-br from-purple-100/50 dark:from-purple-900/50 to-violet-100/30 dark:to-violet-900/30",
        )}
      />

      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-purple-50/0 dark:from-purple-950/0 to-violet-50/0 dark:to-violet-950/0 opacity-0 transition-opacity duration-300 group-hover:from-purple-50/40 dark:group-hover:from-purple-950/40 group-hover:to-violet-50/20 dark:group-hover:to-violet-950/20 group-hover:opacity-100" />

      {/* Large background number */}
      <div className="pointer-events-none absolute right-4 top-4 font-display text-8xl font-bold leading-none text-purple-50/80 dark:text-purple-950/80">
        {item.number}
      </div>

      {/* Corner dots */}
      <DecorativeDots />

      {/* Icon badge */}
      <div
        className={cn(
          "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl",
          item.highlighted
            ? "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/25 dark:shadow-purple-400/25"
            : "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Decorative line */}
      <div className="mb-4 h-0.5 w-12 bg-gradient-to-r from-purple-400 dark:from-purple-600 to-violet-400 dark:to-violet-600" />

      {/* Title */}
      <h3 className="mb-3 font-display text-lg font-semibold tracking-wide text-gray-900 dark:text-slate-100">
        {item.title}
      </h3>

      {/* Description */}
      <p className="mb-5 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
        {item.description}
      </p>

      {/* Features list */}
      <ul className="space-y-2.5">
        {item.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Bottom decorative pattern */}
      <BottomCircles />
    </div>
  );
}

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
