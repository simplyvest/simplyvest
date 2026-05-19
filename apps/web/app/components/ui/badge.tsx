import * as React from "react";
import { cn } from "@/utils/cn";

const variants = {
  sol: "bg-tag1 text-tag1t",
  sol2: "bg-tag2 text-tag2t",
  sol3: "bg-tag3 text-tag3t",
  warn: "bg-warn/10 text-warn",
} as const;

export function Badge({
  variant = "sol",
  children,
  className,
}: {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
