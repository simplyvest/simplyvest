import * as React from "react";
import { cn } from "@/utils/cn";

export function GapCard({
  number,
  title,
  children,
  className,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg1 px-5 py-5 transition-colors hover:border-warn",
        className,
      )}
    >
      <div className="font-display text-4xl leading-none text-warn/40">
        {number}
      </div>
      <h4 className="mt-2 font-display text-lg tracking-wide">{title}</h4>
      <p className="mt-2 text-[0.83rem] leading-relaxed text-muted">
        {children}
      </p>
    </div>
  );
}
