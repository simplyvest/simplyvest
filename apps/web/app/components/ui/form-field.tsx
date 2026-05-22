import * as React from "react";

import { cn } from "@/utils/cn";

export function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-text">
        {label}
        {required && <span className="ml-0.5 text-warn">*</span>}
      </span>
      {children}
    </label>
  );
}
