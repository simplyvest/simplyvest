import * as React from "react";

import { cn } from "@/utils/cn";

export function LandingCard({
  href,
  title,
  desc,
  meta,
  static: isStatic,
  className,
}: {
  href?: string;
  title: React.ReactNode;
  desc?: string;
  meta?: string;
  static?: boolean;
  className?: string;
}) {
  const classes = cn(
    "block rounded-xl border border-border bg-bg1 px-5 py-5 transition-all no-underline",
    isStatic ? "cursor-default" : "hover:translate-x-1 hover:border-sol hover:no-underline",
    className,
  );

  const content = (
    <>
      <span className="block font-semibold text-text">{title}</span>
      {desc && <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted">{desc}</p>}
      {meta && <p className="mt-1 font-mono text-[0.75rem] text-dim">{meta}</p>}
    </>
  );

  if (href && !isStatic) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return <div className={classes}>{content}</div>;
}
