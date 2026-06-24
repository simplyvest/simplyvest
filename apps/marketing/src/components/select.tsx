import { cn } from "@simplyvest/ui/cn";
import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border bg-bg2 px-3.5 py-2.5 text-sm text-text",
        "focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-warn" : "border-border2",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export { Select };
