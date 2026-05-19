import * as React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/utils/cn";

export function CTA({ className }: { className?: string }) {
  return (
    <section className={cn("mx-auto max-w-4xl px-6 pt-16", className)}>
      <div className="rounded-xl border border-sol bg-gradient-to-br from-sol/5 to-sol2/5 px-8 py-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Start Vesting Today
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          Join the waitlist to be the first to know when SimplyVest launches.
        </p>
        <div className="mt-8">
          <Link
            to="/waitlist"
            className="inline-block rounded-md bg-[#7c3aed] px-8 py-3 text-sm font-semibold text-white no-underline transition-all hover:bg-[#6d28d9] hover:no-underline focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
