import { Link } from "@tanstack/react-router";
import { LuArrowRight, LuBookOpen, LuUsers } from "react-icons/lu";

import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";

import { HeroStatsCards } from "./hero-stats-cards";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white dark:from-slate-950 via-purple-50/20 dark:via-purple-950 to-white dark:to-slate-950">
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
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:pt-12">
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
            <Link
              to="/app/dashboard"
              search={{ tab: "created" }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-900/30 transition-all hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-800/30 hover:brightness-110 no-underline hover:no-underline focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            >
              Try Beta App
              <LuArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/waitlist"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-slate-200 transition-all hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md no-underline hover:no-underline focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            >
              Join Waitlist
              <LuUsers className="h-4 w-4 text-purple-500 dark:text-purple-300" />
            </Link>

            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-slate-200 transition-all hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md no-underline hover:no-underline focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
            >
              Read Docs
              <LuBookOpen className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            </Link>
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
