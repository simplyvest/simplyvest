import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../cn";
import { LOGO_BRAND_COLOR, LOGO_MARK_PATH } from "./paths";

const logoVariants = cva("shrink-0", {
  variants: {
    variant: {
      tile: "",
      mark: "",
    },
  },
  defaultVariants: {
    variant: "tile",
  },
});

type LogoBackground = "brand" | "primary" | "transparent";

export interface LogoProps
  extends
    Omit<React.SVGProps<SVGSVGElement>, "width" | "height">,
    VariantProps<typeof logoVariants> {
  size?: number;
  background?: LogoBackground;
  title?: string;
}

function resolveBackground(background: LogoBackground): string {
  switch (background) {
    case "primary":
      return "var(--primary)";
    case "transparent":
      return "transparent";
    case "brand":
    default:
      return LOGO_BRAND_COLOR;
  }
}

export function Logo({
  variant = "tile",
  size = 32,
  background = "brand",
  className,
  title = "SimplyVest",
  ...props
}: LogoProps) {
  const ariaLabel = props["aria-label"] ?? title;
  const tileBackground = variant === "tile" ? resolveBackground(background) : "transparent";
  const markFill = variant === "mark" ? "currentColor" : "#ffffff";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      className={cn(logoVariants({ variant }), className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {variant === "tile" ? <rect width="32" height="32" fill={tileBackground} /> : null}
      <path d={LOGO_MARK_PATH} fill={markFill} />
    </svg>
  );
}

export { LOGO_BRAND_COLOR, LOGO_MARK_PATH };
