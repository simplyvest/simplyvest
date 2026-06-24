import { cn } from "@simplyvest/ui/cn";
import * as React from "react";

const variants = {
  primary: "bg-badge-purple text-badge-purple-text",
  success: "bg-badge-green text-badge-green-text",
  info: "bg-badge-blue text-badge-blue-text",
  warn: "bg-warn/10 text-warn",
  sol: "bg-badge-blue text-badge-blue-text",
  sol2: "bg-badge-green text-badge-green-text",
} as const;

export function Badge({
  variant = "primary",
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
