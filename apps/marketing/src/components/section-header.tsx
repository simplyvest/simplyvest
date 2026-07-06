import { cn } from "@simplyvest/ui/cn";
import type { ReactNode } from "react";

export const SECTION_PADDING = "py-24 lg:py-32 scroll-mt-28";

export function SectionHeader({
  number,
  title,
  description,
  align = "left",
  className,
}: {
  number: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "mx-auto max-w-2xl text-center",
        align === "left" && "max-w-2xl",
        className,
      )}
    >
      <span className="inline-flex items-center rounded-full border border-primary/20 bg-badge-purple px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-badge-purple-text">
        {number}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? <p className="text-lg leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
}
