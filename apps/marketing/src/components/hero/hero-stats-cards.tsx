import { LuCalendar, LuTrendingUp, LuLock } from "react-icons/lu";

const barValues = [30, 45, 60, 75, 85, 95];

function HeroStatsCards() {
  return (
    <>
      {/* Connecting SVG lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hero-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M200 148 L200 192"
          stroke="url(#hero-line)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        <path
          d="M200 348 L200 392"
          stroke="url(#hero-line)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      </svg>

      <div className="flex flex-col items-center gap-12">
        {/* Card 1 — Vesting Schedule */}
        <div className="group w-80 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-5 shadow-lg shadow-gray-900/5 dark:shadow-slate-950/20 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
              <LuCalendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-900 dark:text-slate-100">
                Vesting Schedule
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Team Token Grant</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>8 / 12 months</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">67 %</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
              <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-slate-500">6,700 / 10,000 tokens</p>
          </div>
        </div>

        {/* Card 2 — Token Stream */}
        <div className="group w-80 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-5 shadow-lg shadow-gray-900/5 dark:shadow-slate-950/20 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50">
              <LuTrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-900 dark:text-slate-100">
                Token Stream
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Active Distribution</p>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="mt-4 flex h-12 items-end gap-1.5">
            {barValues.map((val) => (
              <div
                key={val}
                className="flex-1 rounded-t bg-gradient-to-t from-purple-400 to-purple-300"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
            <span className="font-medium text-green-600 dark:text-green-400">+41.6 tokens</span>{" "}
            streamed
          </p>
        </div>

        {/* Card 3 — Security Badge */}
        <div className="group w-80 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 p-5 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-900/30 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <LuLock className="h-5 w-5 text-white" />
            </div>
            <div>
              <div class="text-sm font-semibold">Security Badge</div>
              <p className="text-xs text-purple-200">Vault Protection</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-lg font-bold">PDA Vault</span>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            <span className="text-xs text-purple-200">Secured</span>
          </div>
        </div>
      </div>
    </>
  );
}

export { HeroStatsCards };
