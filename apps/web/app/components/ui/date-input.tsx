import * as React from "react";

import { cn } from "@/utils/cn";

const base =
  "w-full rounded-md border border-border2 bg-bg2 px-3.5 py-2.5 text-sm text-text placeholder:text-dim focus-visible:border-sol focus-visible:ring-2 focus-visible:ring-sol focus:outline-none transition-colors";

export const DateInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return <input ref={ref} type="date" className={cn(base, className)} {...props} />;
});
DateInput.displayName = "DateInput";
