import { Link } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/utils/cn";

import { buttonVariants } from "./button";

export interface LinkButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children?: React.ReactNode;
  to: string;
  search?: Record<string, unknown>;
  params?: Record<string, unknown>;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  onClick?: () => void;
}

function LinkButton({ variant, size, className, children, to, search, ...props }: LinkButtonProps) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        buttonVariants({ variant, size, className }),
        "no-underline hover:no-underline",
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export { LinkButton };
