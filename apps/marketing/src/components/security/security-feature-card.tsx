import { cn } from "@simplyvest/ui/cn";
import * as React from "react";

export interface FeatureCardProps {
  feature: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    title: string;
    description: string;
  };
  className?: string;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-2xl border border-white/60 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white/80 hover:shadow-md hover:shadow-purple-600/5",
        "dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-purple-700/60 dark:hover:bg-slate-900/80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          {feature.label}
        </span>
      </div>

      <h3 className="text-lg font-bold text-text">{feature.title}</h3>

      <p className="flex-1 text-sm leading-relaxed text-muted">{feature.description}</p>
    </div>
  );
}
