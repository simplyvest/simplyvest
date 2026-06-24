import * as React from "react";

import { cn } from "./cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border bg-bg2 px-3.5 py-2.5 text-sm text-text placeholder:text-dim",
        "focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-warn" : "border-border2",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix: string;
  invalid?: boolean;
}

function InputGroup({ prefix, className, invalid, ...props }: InputGroupProps) {
  return (
    <div className={cn("flex", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-l-md border border-r-0 border-border2 bg-bg2 px-3 font-mono text-sm text-dim",
          invalid && "border-warn",
        )}
      >
        {prefix}
      </span>
      <input
        className={cn(
          "flex h-10 flex-1 rounded-r-md border bg-bg2 px-3.5 py-2.5 text-sm text-text placeholder:text-dim",
          "focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-warn" : "border-border2",
          "rounded-l-none",
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    </div>
  );
}

export { Input, InputGroup };
