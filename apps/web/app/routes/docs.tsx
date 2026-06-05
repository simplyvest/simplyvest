import { createRoute } from "@tanstack/react-router";
import { LuShield } from "react-icons/lu";

import { AccountTypeCard } from "@/components/docs/account-type-card";
import { SectionHeader } from "@/components/docs/docs-data";
import { streamTypes, accountTypes, securityFeatures } from "@/components/docs/docs-data";
import { DocsHero } from "@/components/docs/docs-hero";
import { SecurityFeatureRow } from "@/components/docs/security-feature-row";
import { StreamTypeCard } from "@/components/docs/stream-type-card";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/docs",
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <DocsHero />

      {/* ── 01  Stream Types ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            num="01"
            title="Stream Types"
            subtitle="Two types of vesting streams for different distribution models."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {streamTypes.map((stream) => (
              <StreamTypeCard key={stream.title} {...stream} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 02  Account Model ───────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            num="02"
            numColor="blue"
            title="Account Model"
            subtitle="Three on-chain account types power the protocol."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {accountTypes.map((acct) => (
              <AccountTypeCard key={acct.monoLabel} {...acct} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 03  Security Model ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/30 to-white dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950 py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(147,51,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <LuShield className="h-[600px] w-[600px] text-purple-600 dark:text-purple-400 opacity-[0.05]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeader
            num="03"
            title="Security Model"
            subtitle="Key security properties of the protocol."
            center
          />
          <div className="mt-12 rounded-[32px] border border-white/60 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/80 p-8 shadow-2xl shadow-purple-600/10 backdrop-blur-sm sm:p-10">
            <div className="space-y-5">
              {securityFeatures.map((feat) => (
                <SecurityFeatureRow key={feat.title} {...feat} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
