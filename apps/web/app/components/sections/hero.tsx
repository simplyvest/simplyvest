import { Link } from "@tanstack/react-router";
import * as React from "react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border pb-8 pt-28">
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <span className="font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(8rem,22vw,18rem)] text-border">
          SOLANA
        </span>
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-wide text-sol2">
          <span className="text-dim">{"//"}</span>
          Solana Vesting Protocol
        </div>

        <h1 className="mt-5">
          SIMPLY
          <br />
          <em>VEST</em>
        </h1>

        <p className="max-w-[560px] text-lg leading-relaxed text-muted">
          Non-custodial, programmable token vesting with time-based streams and milestone-gated
          releases on Solana.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/app/dashboard"
            search={{ tab: "created" }}
            className="rounded-md bg-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white no-underline transition-all hover:bg-[#6d28d9] hover:no-underline focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none"
          >
            Try Beta App
          </Link>
          <Link
            to="/waitlist"
            className="rounded-md border border-border2 bg-bg2 px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-muted no-underline transition-colors hover:border-sol hover:text-text hover:no-underline focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none"
          >
            Join Waitlist
          </Link>
          <Link
            to="/docs"
            className="rounded-md border border-border2 bg-bg2 px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-muted no-underline transition-colors hover:border-sol hover:text-text hover:no-underline focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none"
          >
            Read Docs
          </Link>
        </div>
      </div>
    </section>
  );
}
