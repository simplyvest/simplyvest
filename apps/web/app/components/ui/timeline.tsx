import * as React from "react";
import { cn } from "@/utils/cn";

export interface TimelineItem {
  week: string;
  content: string;
}

export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <div className={cn("relative ml-7 pl-3", className)}>
      <div
        className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full"
        style={{
          background: "linear-gradient(to bottom, var(--sol), var(--sol2))",
        }}
      />
      {items.map((item, i) => (
        <div key={i} className="relative mb-6 last:mb-0">
          <div
            className="absolute -left-[1.44rem] top-[0.45rem] h-2.5 w-2.5 rounded-full border-2"
            style={{
              background: "var(--sol)",
              borderColor: "var(--bg)",
              boxShadow: "0 0 0 2px var(--sol)",
            }}
          />
          <div className="font-mono text-[0.68rem] uppercase tracking-wide text-sol2">
            {item.week}
          </div>
          <p className="mt-0.5 text-[0.87rem] leading-relaxed text-muted">
            {item.content}
          </p>
        </div>
      ))}
    </div>
  );
}
