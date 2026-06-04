import { CancelAnytimeCard } from "./cancel-anytime-card";
import { LinearVestingCard } from "./linear-vesting-card";
import { MilestonePaymentsCard } from "./milestone-payments-card";
import { PdaVaultsCard } from "./pda-vaults-card";

export function Features() {
  return (
    <section className="bg-gradient-to-b from-white dark:from-slate-950 to-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold tracking-widest text-gray-500 dark:text-slate-400">
            01
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-5xl">
            Features
          </h2>
          <p className="text-lg text-gray-500 dark:text-slate-400">
            Everything you need to build trustless vesting schedules on Solana — from linear unlocks
            to milestone-based releases, all secured by program-derived vaults.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <LinearVestingCard />
          <MilestonePaymentsCard />
          <PdaVaultsCard />
          <CancelAnytimeCard />
        </div>
      </div>
    </section>
  );
}
