import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-sm hover:bg-primary/90",
        destructive: "bg-warn text-white shadow-sm hover:bg-warn/90",
        outline: "border border-border2 bg-transparent shadow-sm hover:bg-bg2",
        secondary: "bg-bg2 text-text border border-border shadow-sm hover:bg-border",
        ghost: "hover:bg-bg2 text-muted hover:text-text",
        link: "text-primary underline-offset-4 hover:underline",
        brand:
          "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:brightness-110",
        "outline-brand":
          "border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md",
        "light-brand":
          "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-lg hover:scale-105 hover:shadow-xl",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
