import { LuArrowRight, LuSparkles } from "react-icons/lu";

import { LinkButton } from "@/components/ui/link-button";
import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";

export function CTA() {
  return (
    <section className="bg-gradient-to-b from-white dark:from-slate-950 to-gray-50 dark:to-slate-950 py-24">
      <div className="relative mx-auto max-w-4xl px-6">
        {/* Glow effect behind card */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-purple-500/20 blur-3xl" />

        {/* Main card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-violet-400 px-8 py-20 text-center">
          {/* Decorative floating orbs */}
          <SectionDecorations>
            <BlobBlob className="absolute -left-20 -top-20 h-64 w-64 bg-violet-400/30" />
            <BlobBlob className="absolute -bottom-16 -right-16 h-56 w-56 bg-purple-300/25" />
          </SectionDecorations>

          {/* Wave pattern SVG */}
          <svg
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 w-full opacity-10"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z" fill="white" />
          </svg>

          {/* Floating dots */}
          <div className="pointer-events-none absolute left-12 top-8 h-2 w-2 rounded-full bg-white/40 dark:bg-slate-900/40 animate-pulse" />
          <div className="pointer-events-none absolute right-16 top-14 h-1.5 w-1.5 rounded-full bg-white/30 dark:bg-slate-900/30 animate-pulse [animation-delay:200ms]" />
          <div className="pointer-events-none absolute bottom-12 left-20 h-1.5 w-1.5 rounded-full bg-white/25 dark:bg-slate-900/25 animate-pulse [animation-delay:400ms]" />
          <div className="pointer-events-none absolute bottom-20 right-12 h-2 w-2 rounded-full bg-white/35 dark:bg-slate-900/35 animate-pulse [animation-delay:600ms]" />

          {/* Glass highlight on top */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-slate-950/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-gradient-to-b from-white/10 dark:from-slate-950/10 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 dark:border-slate-700/20 bg-white/15 dark:bg-slate-900/15 backdrop-blur-sm">
              <LuSparkles className="h-7 w-7 text-white" />
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Start Vesting Today
            </h2>

            <p className="mx-auto mt-4 max-w-md text-lg text-purple-50">
              Join the waitlist to be the first to know when SimplyVest launches.
            </p>

            <div className="mt-10">
              <LinkButton
                to="/waitlist"
                variant="light-brand"
                className="rounded-xl px-8 py-3.5 text-base"
              >
                Join Waitlist
                <LuArrowRight className="h-5 w-5" />
              </LinkButton>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-purple-50">
              <span>No credit card required</span>
              <span className="h-1 w-1 rounded-full bg-white/60 dark:bg-slate-900/60" />
              <span>Launch in Q2 2026</span>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute -bottom-8 inset-x-8 h-16 rounded-3xl bg-purple-400/10 blur-2xl" />
      </div>
    </section>
  );
}
