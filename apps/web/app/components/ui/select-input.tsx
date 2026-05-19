import * as React from "react";
import { cn } from "@/utils/cn";

export const SelectInput = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-md border border-border2 bg-bg2 px-3.5 py-2.5 text-sm text-text focus-visible:border-sol focus-visible:ring-2 focus-visible:ring-sol focus:outline-none transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
SelectInput.displayName = "SelectInput";
