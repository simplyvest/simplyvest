import * as React from "react";
import { LuCheck } from "react-icons/lu";

import { cn } from "@/utils/cn";

export interface FeatureCardProps {
  feature: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    title: string;
    description: string;
  };
  highlighted?: boolean;
}

export function FeatureCard({ feature, highlighted }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl p-6",
        highlighted
          ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white"
          : "border border-white/60 bg-white/60 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60",
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            highlighted
              ? "bg-white/20 text-white"
              : "bg-gradient-to-br from-purple-600 to-purple-500 text-white",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5">
          {highlighted ? (
            <span className="font-mono text-3xl font-bold">{feature.label}</span>
          ) : (
            <>
              <span
                className={cn(
                  "font-mono text-xs font-medium",
                  highlighted ? "text-white/80" : "text-purple-600 dark:text-purple-400",
                )}
              >
                {feature.label}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  highlighted ? "text-white/80" : "text-purple-600 dark:text-purple-400",
                )}
              >
                {feature.title}
              </span>
            </>
          )}
        </div>
      </div>

      {highlighted ? (
        <>
          <h3 className="text-2xl font-bold">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-purple-100">{feature.description}</p>
        </>
      ) : (
        <>
          <div>
            <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              {feature.label}
            </span>
            <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-slate-100">
              {feature.title}
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">
            {feature.description}
          </p>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <LuCheck className="h-4 w-4" />
            <span className="text-xs font-medium">Verified</span>
          </div>
        </>
      )}
    </div>
  );
}
