import * as React from "react";

import { cn } from "@/utils/cn";

const accentColors = {
  sol: "text-sol",
  sol2: "text-sol2",
  sol3: "text-sol3",
  warn: "text-warn",
} as const;

export function Stat({
  value,
  label,
  color = "sol",
  desc,
  className,
}: {
  value: string;
  label: string;
  color?: keyof typeof accentColors;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-bg1 px-5 py-5", className)}>
      <div className={cn("font-display text-3xl leading-none", accentColors[color])}>{value}</div>
      <div className="mt-1 font-mono text-[0.8rem] text-muted">{label}</div>
      {desc && <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{desc}</p>}
    </div>
  );
}
