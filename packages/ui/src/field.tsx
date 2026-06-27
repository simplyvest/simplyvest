import * as React from "react";

import { cn } from "./cn";

export interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, required, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-text">
        {label}
        {required && <span className="ml-0.5 text-warn">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-warn" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { Field };
