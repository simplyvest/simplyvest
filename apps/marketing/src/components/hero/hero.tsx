import { BlobBlob, SectionDecorations } from "@simplyvest/ui/section-decorations";
import { LuArrowRight, LuBookOpen, LuUsers } from "react-icons/lu";

import { LinkButton } from "../link-button";
import { HeroStatsCards } from "./hero-stats-cards";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-b from-white dark:from-slate-950 via-purple-50/20 dark:via-purple-950 to-white dark:to-slate-950">
      {/* ---- Decorative background ---- */}
      <SectionDecorations>
        {/* Blurred blobs */}
        <BlobBlob className="absolute -left-32 -top-32 h-96 w-96 bg-purple-300/20 dark:bg-purple-900/20" />
        <BlobBlob className="absolute -bottom-32 -right-32 h-96 w-96 bg-purple-400/15 dark:bg-purple-800/15" />
        <BlobBlob className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 bg-purple-200/10 dark:bg-purple-800/10" />

        {/* Dot grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
          <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>

        {/* Orbital rings */}
        <div className="absolute left-1/2 top-[40%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-200/30 dark:border-purple-800/30" />
        <div className="absolute left-1/2 top-[40%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-100/20 dark:border-purple-900/50" />
      </SectionDecorations>

      {/* ---- Main content ---- */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Left column — copy & CTAs */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/80 px-4 py-1.5 font-mono text-[0.72rem] uppercase tracking-wide text-purple-700 dark:text-purple-300">
            <span className="text-purple-400 dark:text-purple-200">{"//"}</span>
            Solana Vesting Protocol
          </div>

          {/* Heading */}
          <h1 className="mt-8 font-display text-6xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-7xl lg:text-8xl">
            SIMPLY
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
              VEST
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-gray-500 dark:text-slate-400">
            Non-custodial, programmable token vesting with time-based streams and milestone-gated
            releases on Solana.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <LinkButton
              to="/app"
              search={{ tab: "created" }}
              variant="brand"
              className="rounded-xl px-6 py-3"
            >
              Try Beta App
              <LuArrowRight className="h-4 w-4" />
            </LinkButton>

            <LinkButton to="/waitlist" variant="outline-brand" className="rounded-xl px-6 py-3">
              Join Waitlist
              <LuUsers className="h-4 w-4 text-purple-500 dark:text-purple-300" />
            </LinkButton>

            <a
              href={import.meta.env.VITE_DOCS_URL ?? "https://docs.simplyvest.com"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-600 px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md transition-colors no-underline"
            >
              Read Docs
              <LuBookOpen className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            </a>
          </div>
        </div>

        {/* Right column — floating dashboard cards (lg+) */}
        <div className="relative mt-16 hidden lg:mt-0 lg:flex lg:flex-col lg:items-center lg:justify-center">
          <HeroStatsCards />
        </div>
      </div>
    </section>
  );
}
