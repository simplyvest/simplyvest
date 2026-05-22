import * as React from "react";

import { cn } from "@/utils/cn";

export function VestingCard({
  color = "#9945ff",
  label,
  title,
  description,
  examples,
  children,
  className,
}: {
  color?: string;
  label: string;
  title: string;
  description: string;
  examples: string[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border border-border bg-bg1", className)}>
      <div className="h-0.5 w-full" style={{ background: color }} />
      <div className="px-6 py-5">
        <div className="font-mono text-[0.67rem] uppercase tracking-wide" style={{ color }}>
          {label}
        </div>
        <h3 className="mt-2 font-display text-2xl tracking-wide">{title}</h3>
        {children}
        <p className="mt-3 text-[0.88rem] leading-relaxed text-muted">{description}</p>
        <ul className="mt-4 space-y-1">
          {examples.map((ex, i) => (
            <li
              key={i}
              className="flex items-start gap-2 border-b border-border py-1 text-[0.83rem] text-muted last:border-none"
            >
              <span
                className="mt-0.5 flex-shrink-0 text-[0.75rem]"
                style={{ color }}
                aria-hidden="true"
              >
                →
              </span>
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
