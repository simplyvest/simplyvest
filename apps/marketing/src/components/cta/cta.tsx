import { SectionDecorations, BlobBlob } from "@simplyvest/ui/section-decorations";
import { LuArrowRight, LuSparkles } from "react-icons/lu";

import { LinkButton } from "../link-button";
import { Reveal } from "../reveal";
import { SECTION_PADDING } from "../section-header";

export function CTA() {
  return (
    <section
      className={`${SECTION_PADDING} bg-gradient-to-b from-white dark:from-slate-950 to-gray-50 dark:to-slate-950`}
    >
      <div className="relative mx-auto max-w-4xl px-6">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/20 blur-3xl" />

        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-violet-400 px-8 py-16 text-center transition-transform duration-300 hover:-translate-y-1 sm:py-20">
            <SectionDecorations>
              <BlobBlob className="absolute -left-20 -top-20 h-64 w-64 bg-violet-400/30" />
              <BlobBlob className="absolute -bottom-16 -right-16 h-56 w-56 bg-purple-300/25" />
            </SectionDecorations>

            <svg
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 w-full opacity-10"
              viewBox="0 0 1440 120"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z" fill="white" />
            </svg>

            <div className="pointer-events-none absolute left-12 top-8 h-2 w-2 rounded-full bg-white/40 animate-pulse" />
            <div className="pointer-events-none absolute right-16 top-14 h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:200ms]" />
            <div className="pointer-events-none absolute bottom-12 left-20 h-1.5 w-1.5 rounded-full bg-white/25 animate-pulse [animation-delay:400ms]" />
            <div className="pointer-events-none absolute bottom-20 right-12 h-2 w-2 rounded-full bg-white/35 animate-pulse [animation-delay:600ms]" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
                <LuSparkles className="h-7 w-7 text-white" />
              </div>

              <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Issue equity. Vest on-chain.
              </h2>

              <p className="mx-auto mt-4 max-w-md text-lg text-purple-50">
                Join the waitlist for early access to tokenized equity vesting with web2 UX.
              </p>

              <div className="mt-10">
                <LinkButton
                  href="/waitlist"
                  variant="light-brand"
                  className="rounded-xl px-8 py-3.5 text-base transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Join Waitlist
                  <LuArrowRight className="h-5 w-5" />
                </LinkButton>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-purple-50">
                <span>No credit card required</span>
                <span className="h-1 w-1 rounded-full bg-white/60" />
                <span>Launch in Q2 2026</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="pointer-events-none absolute -bottom-8 inset-x-8 h-16 rounded-3xl bg-purple-400/10 blur-2xl" />
      </div>
    </section>
  );
}
