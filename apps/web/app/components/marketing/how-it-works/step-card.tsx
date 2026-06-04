import * as React from "react";

import { cn } from "@/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Step {
  readonly number: 1 | 2 | 3;
  readonly title: string;
  readonly icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  readonly label: string;
  readonly description: string;
  readonly details: readonly string[];
}

/* -------------------------------------------------------------------------- */
/*  Step Card                                                                 */
/* -------------------------------------------------------------------------- */

function StepCard({ step, index }: { step: Step; index: number }) {
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
          "group relative w-full flex-1 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-purple-200 hover:shadow-md dark:border-slate-600 dark:bg-slate-900 sm:p-8",
          /* Offset on md+ so card doesn't overlap timeline circle */
          "md:w-[calc(50%-2.5rem)]",
          isEven ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8",
        )}
      >
        {/* Hover gradient overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-50/0 to-purple-100/0 dark:from-purple-950/0 dark:to-purple-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Icon badge — top right */}
        <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors duration-300 group-hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-400 dark:group-hover:bg-purple-800">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>

        {/* Title + mono label */}
        <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
        <span className="mt-1.5 inline-block rounded-md bg-purple-100 px-2.5 py-0.5 font-mono text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
          {step.label}
        </span>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-muted">{step.description}</p>

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

export { StepCard };
export type { Step };
