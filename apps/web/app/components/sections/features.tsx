import { TrendingUp, Flag, Shield, XCircle } from "lucide-react";

function LinearVestingCard() {
  const barValues = [20, 35, 50, 65, 80, 95, 100];

  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-7">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600" />

      <div className="relative p-8">
        <div className="flex items-start gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold tracking-wide text-purple-700">
              <TrendingUp className="h-3.5 w-3.5" />
              TIME-BASED
            </div>

            <h3 className="text-2xl font-bold text-gray-900">Linear Vesting</h3>

            <p className="text-gray-500">
              Tokens unlock continuously over a predefined schedule. Set it once and watch
              allocations grow block by block with full on-chain enforcement.
            </p>

            <ul className="space-y-2">
              {[
                "Continuous block-by-block token release",
                "Custom start and end timestamps",
                "Automatic cliff periods supported",
                "On-chain schedule verification",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Bar chart visual */}
          <div className="hidden flex-shrink-0 items-end gap-1.5 self-end pb-2 sm:flex">
            {barValues.map((value) => (
              <div
                key={value}
                className="w-6 rounded-t-sm bg-gradient-to-t from-purple-500 to-purple-400 transition-all duration-500 group-hover:from-purple-600 group-hover:to-purple-500"
                style={{ height: `${value * 0.64}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestonePaymentsCard() {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-5">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
          <Flag className="h-3.5 w-3.5" />
          MILESTONE
        </div>

        <h3 className="text-2xl font-bold text-gray-900">Milestone Payments</h3>

        <p className="text-gray-500">
          Release funds only when verifiable conditions are met. Perfect for contractor agreements,
          grants, and performance-based compensation.
        </p>

        <ul className="space-y-2">
          {[
            "Conditional on-chain fund release",
            "Flexible milestone definitions",
            "Dispute resolution mechanisms",
            "Multi-party approval workflows",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {point}
            </li>
          ))}
        </ul>

        {/* Milestone path illustration */}
        <div className="flex items-center gap-0 pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div className="h-0.5 w-10 bg-gradient-to-r from-emerald-300 to-emerald-500" />
              )}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  i === 2
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-200"
                    : "border-2 border-emerald-300 bg-white"
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${i === 2 ? "text-white" : "text-emerald-500"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PdaVaultsCard() {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-5">
      {/* Dot pattern background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Large shield watermark */}
      <Shield className="absolute -bottom-4 -right-4 h-40 w-40 text-blue-500 opacity-5" />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
          <Shield className="h-3.5 w-3.5" />
          NON-CUSTODIAL
        </div>

        <h3 className="text-2xl font-bold text-gray-900">PDA Vaults</h3>

        <p className="text-gray-500">
          Every vesting schedule lives inside a Program Derived Address — a trustless vault that no
          single party can drain or tamper with.
        </p>

        <ul className="space-y-2">
          {[
            "Program Derived Address isolation",
            "No third-party custody risk",
            "Immutable on-chain vault logic",
            "Transparent balance tracking",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CancelAnytimeCard() {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-7">
      {/* Gradient corner accent */}
      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-rose-500/10 to-orange-500/10 blur-2xl" />

      {/* Large XCircle watermark */}
      <XCircle className="absolute -bottom-6 -right-6 h-48 w-48 text-rose-500 opacity-10" />

      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
            <XCircle className="h-3.5 w-3.5" />
            CONTROL
          </div>

          <h3 className="text-2xl font-bold text-gray-900">Cancel Anytime</h3>

          <p className="text-gray-500">
            Grant issuer retains the authority to halt vesting and reclaim unvested tokens at any
            point — full administrative control without compromising user-vested balances.
          </p>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              "Immediate schedule cancellation",
              "Unvested token recovery",
              "Granular per-beneficiary control",
              "Emergency pause capability",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold tracking-widest text-gray-500">
            01
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Features</h2>
          <p className="text-lg text-gray-500">
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
