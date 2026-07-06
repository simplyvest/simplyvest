import { cn } from "@simplyvest/ui/cn";
import type { ComponentType } from "react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-purple-600/5",
        "dark:border-slate-700 dark:bg-slate-900 dark:hover:border-purple-700/60",
        className,
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-badge-purple text-primary transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-text">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
