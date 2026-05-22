import * as React from "react";

import { cn } from "@/utils/cn";

export function CheckboxInput({
  label,
  name,
  checked,
  onChange,
  className,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label className={cn("flex items-start gap-3", className)}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-border2 bg-bg2 text-sol focus-visible:ring-2 focus-visible:ring-sol"
      />
      <span className="text-sm text-muted">{label}</span>
    </label>
  );
}
