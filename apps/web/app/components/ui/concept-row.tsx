import * as React from "react";
import { cn } from "@/utils/cn";

export function ConceptRow({
  icon,
  title,
  monoLabel,
  color = "#9945ff",
  children,
  className,
}: {
  icon: string;
  title: string;
  monoLabel: string;
  color?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-xl border border-border md:grid-cols-[220px_1fr]",
        className,
      )}
    >
      <div
        className="flex flex-col justify-center border-r border-border bg-bg2 px-5 py-6"
      >
        <div className="text-3xl" aria-hidden="true">{icon}</div>
        <div
          className="mt-1 font-display text-2xl tracking-wide"
          style={{ color }}
        >
          {title}
        </div>
        <div className="mt-1 font-mono text-[0.65rem] tracking-wide text-dim">
          {monoLabel}
        </div>
      </div>
      <div className="bg-bg1 px-6 py-5">
        {children}
      </div>
    </div>
  );
}
