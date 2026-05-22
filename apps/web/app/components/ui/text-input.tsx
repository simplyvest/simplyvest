import * as React from "react";

import { cn } from "@/utils/cn";

const base =
  "w-full rounded-md border border-border2 bg-bg2 px-3.5 py-2.5 text-sm text-text placeholder:text-dim focus-visible:border-sol focus-visible:ring-2 focus-visible:ring-sol focus:outline-none transition-colors";

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn(base, className)} {...props} />;
});
TextInput.displayName = "TextInput";

export function InputGroup({
  prefix,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string }) {
  return (
    <div className={cn("flex", className)}>
      {prefix && (
        <span className="inline-flex items-center rounded-l-md border border-r-0 border-border2 bg-bg2 px-3 font-mono text-sm text-dim">
          {prefix}
        </span>
      )}
      <input className={cn(base, prefix ? "rounded-l-none rounded-r-md" : undefined)} {...props} />
    </div>
  );
}
