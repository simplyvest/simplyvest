import { LuShield } from "react-icons/lu";

export function PdaVaultsCard() {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-5">
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
      <LuShield className="absolute -bottom-4 -right-4 h-40 w-40 text-blue-500 opacity-5" />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
          <LuShield className="h-3.5 w-3.5" />
          NON-CUSTODIAL
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">PDA Vaults</h3>

        <p className="text-gray-500 dark:text-slate-400">
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
            <li
              key={point}
              className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
