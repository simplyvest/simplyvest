import type { ReactNode } from "react";

import { cn } from "./cn";

/**
 * Wrapper for decorative elements inside marketing sections.
 * Positions children absolutely and hides from screen readers.
 */
export function SectionDecorations({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 select-none", className)} aria-hidden>
      {children}
    </div>
  );
}

/**
 * A blurred rounded blob used as background decoration.
 * Always applies `rounded-full blur-3xl`; pass positioning, size,
 * and color via `className` (e.g. `-left-32 top-1/4 h-96 w-96 bg-purple-300/20`).
 */
export function BlobBlob({ className }: { className: string }) {
  return <div className={cn("rounded-full blur-3xl", className)} />;
}
