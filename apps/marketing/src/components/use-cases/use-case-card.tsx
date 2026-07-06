import * as React from "react";

import { DecorativeDots } from "./use-case-decorations";

type UseCaseItem = {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  description: string;
  features: string[];
};

function UseCaseCard({ item }: { item: UseCaseItem }) {
  const Icon = item.icon;

  return (
    <div className="group relative flex h-full flex-col rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md dark:border-slate-600 dark:bg-slate-900 dark:hover:border-purple-800">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-purple-100/50 to-violet-100/30 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:from-purple-900/50 dark:to-violet-900/30" />

      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-purple-50/0 to-violet-50/0 opacity-0 transition-opacity duration-300 group-hover:from-purple-50/40 group-hover:to-violet-50/20 group-hover:opacity-100 dark:group-hover:from-purple-950/40 dark:group-hover:to-violet-950/20" />

      <div
        className="pointer-events-none absolute right-4 top-4 font-display text-8xl font-bold leading-none text-purple-50/80 dark:text-purple-950/80"
        aria-hidden="true"
      >
        {item.number}
      </div>

      <DecorativeDots />

      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors duration-300 group-hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-400 dark:group-hover:bg-purple-900">
        <Icon className="h-6 w-6" />
      </div>

      <div className="mb-4 h-0.5 w-12 bg-gradient-to-r from-purple-400 to-violet-400 dark:from-purple-600 dark:to-violet-600" />

      <h3 className="mb-3 font-display text-lg font-semibold tracking-wide text-gray-900 dark:text-slate-100">
        {item.title}
      </h3>

      <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
        {item.description}
      </p>

      <ul className="mt-auto space-y-2.5 pt-5">
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
    </div>
  );
}

export { UseCaseCard };

export type { UseCaseItem };
