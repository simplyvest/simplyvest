import { LuTrendingUp } from "react-icons/lu";

export function LinearVestingCard() {
  const barValues = [20, 35, 50, 65, 80, 95, 100];

  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-7">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600" />

      <div className="relative p-8">
        <div className="flex items-start gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1 text-xs font-semibold tracking-wide text-purple-700 dark:text-purple-300">
              <LuTrendingUp className="h-3.5 w-3.5" />
              TIME-BASED
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Linear Vesting</h3>

            <p className="text-gray-500 dark:text-slate-400">
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
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300"
                >
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
