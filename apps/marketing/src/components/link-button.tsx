import { buttonVariants } from "@simplyvest/ui/button";
import { cn } from "@simplyvest/ui/cn";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

export interface LinkButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children?: ReactNode;
  href: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  onClick?: () => void;
}

function LinkButton({ variant, size, className, children, href, ...props }: LinkButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        buttonVariants({ variant, size, className }),
        "no-underline hover:no-underline inline-flex",
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export { LinkButton };
