import { BlobBlob, SectionDecorations } from "@simplyvest/ui/section-decorations";
import { LuArrowRight, LuBookOpen, LuUsers } from "react-icons/lu";

import { DAPP_URL, DOCS_URL } from "../../constants";
import { LinkButton } from "../link-button";
import { Reveal } from "../reveal";
import { HeroStatsCards } from "./hero-stats-cards";
import { HeroStatsMobile } from "./hero-stats-mobile";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-b from-white dark:from-slate-950 via-purple-50/20 dark:via-purple-950 to-white dark:to-slate-950 pt-28 pb-16 lg:pb-0">
      <SectionDecorations>
        <BlobBlob className="absolute -left-32 -top-32 h-96 w-96 bg-purple-300/20 dark:bg-purple-900/20" />
        <BlobBlob className="absolute -bottom-32 -right-32 h-96 w-96 bg-purple-400/15 dark:bg-purple-800/15" />
        <BlobBlob className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 bg-purple-200/10 dark:bg-purple-800/10" />

        <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
          <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>

        <div className="absolute left-1/2 top-[40%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-200/30 dark:border-purple-800/30" />
        <div className="absolute left-1/2 top-[40%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-100/20 dark:border-purple-900/50" />
      </SectionDecorations>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-12">
        <Reveal>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-badge-purple/80 px-4 py-1.5 font-mono text-[0.72rem] uppercase tracking-wide text-badge-purple-text backdrop-blur-sm">
              <span className="text-primary/70">{"//"}</span>
              Tokenized equity vesting
            </div>

            <h1 className="mt-8 font-display text-5xl font-bold tracking-tight text-text sm:text-6xl lg:text-7xl xl:text-8xl">
              SIMPLY
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-purple-400 bg-clip-text text-transparent">
                VEST
              </span>
            </h1>

            <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-muted">
              Issue and manage tokenized equity for your team with web2 UX — log in with email,
              create your org, and vest on customizable schedules. On-chain custody, zero crypto
              onboarding.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <LinkButton
                href={DAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="brand"
                className="rounded-xl px-6 py-3 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Try Beta App
                <LuArrowRight className="h-4 w-4" />
              </LinkButton>

              <LinkButton
                href="/waitlist"
                variant="outline-brand"
                className="rounded-xl px-6 py-3 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Join Waitlist
                <LuUsers className="h-4 w-4 text-primary" />
              </LinkButton>

              <a
                href={import.meta.env.PUBLIC_DOCS_URL ?? DOCS_URL}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border2 bg-white px-6 py-3 text-sm font-medium text-text no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md dark:bg-slate-900"
              >
                Read Docs
                <LuBookOpen className="h-4 w-4 text-dim" />
              </a>
            </div>

            <HeroStatsMobile />
          </div>
        </Reveal>

        <Reveal
          delay={120}
          className="relative mt-16 hidden lg:mt-0 lg:flex lg:flex-col lg:items-center lg:justify-center"
        >
          <HeroStatsCards />
        </Reveal>
      </div>
    </section>
  );
}
