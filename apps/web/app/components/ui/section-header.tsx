import * as React from "react";

import { cn } from "@/utils/cn";

export function SectionHeader({
  num,
  title,
  sub,
  className,
}: {
  num: string;
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-border pt-14", className)}>
      <div className="font-mono text-[0.68rem] uppercase tracking-wide text-dim">{num}</div>
      <h2 className="mt-2">{title}</h2>
      {sub && <p className="mt-2 max-w-[580px] text-[0.95rem] text-muted">{sub}</p>}
    </div>
  );
}
