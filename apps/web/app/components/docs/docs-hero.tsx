import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";

import { FloatingCards } from "./floating-cards";

export function DocsHero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
      <SectionDecorations>
        <BlobBlob className="absolute -left-32 -top-32 h-96 w-96 bg-purple-300/20" />
        <BlobBlob className="absolute -bottom-32 -right-32 h-96 w-96 bg-purple-400/15" />
        <BlobBlob className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 bg-purple-200/10" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
          <defs>
            <pattern
              id="docs-dots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#docs-dots)" />
        </svg>
      </SectionDecorations>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 dark:bg-purple-950/80 px-4 py-1.5 font-mono text-[0.72rem] uppercase tracking-wide text-purple-700 dark:text-purple-300">
            <span className="text-purple-400">{"//"}</span>
            Protocol V1
          </div>

          <h1 className="mt-8 font-display text-5xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-6xl lg:text-7xl">
            DOCS
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
              OVERVIEW
            </span>
          </h1>

          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-gray-500 dark:text-slate-400">
            SimplyVest is a non-custodial, on-chain SPL-token vesting and distribution protocol
            built with Anchor on Solana. Everything you need to understand the architecture.
          </p>
        </div>

        <FloatingCards />
      </div>
    </section>
  );
}
