import * as React from "react";

import { cn } from "@/utils/cn";

import { DecorativeDots, BottomCircles } from "./use-case-decorations";

type UseCaseItem = {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  description: string;
  features: string[];
  highlighted: boolean;
};

function UseCaseCard({ item }: { item: UseCaseItem }) {
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
      <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
        {item.description}
      </p>

      {/* Features list */}
      <ul className="space-y-2.5">
        {item.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-300"
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

export { UseCaseCard };

export type { UseCaseItem };
