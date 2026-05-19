import * as React from "react";
import { cn } from "@/utils/cn";

const borderColors = {
  default: "border-l-sol",
  green: "border-l-sol2",
  blue: "border-l-sol3",
  warn: "border-l-warn",
  muted: "border-l-border",
} as const;

export function Callout({
  variant = "default",
  children,
  className,
}: {
  variant?: keyof typeof borderColors;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-l-3 border-solid bg-bg1 px-5 py-4 text-[0.9rem] leading-relaxed",
        borderColors[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
