import { LuBuilding2, LuCalendar, LuShield } from "react-icons/lu";

const barValues = [30, 45, 60, 75, 85, 95];

function HeroStatsCards() {
  return (
    <>
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
        <div className="group w-80 rounded-2xl border border-border bg-white p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:-translate-y-1 dark:border-slate-600 dark:bg-slate-900 dark:shadow-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-badge-purple">
              <LuBuilding2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">Acme Labs</div>
              <p className="text-xs text-muted">Organization · 4 grants</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>ACME Equity Token</span>
              <span className="font-medium text-primary">2.4M issued</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg2">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-purple-400" />
            </div>
            <p className="mt-2 text-xs text-dim">1.7M vested · 700K remaining</p>
          </div>
        </div>

        <div className="group w-80 rounded-2xl border border-border bg-white p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:-translate-y-1 dark:border-slate-600 dark:bg-slate-900 dark:shadow-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-badge-green">
              <LuCalendar className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">Advisor Grant</div>
              <p className="text-xs text-muted">4-year vest · 1-year cliff</p>
            </div>
          </div>

          <div className="mt-4 flex h-12 items-end gap-1.5">
            {barValues.map((val) => (
              <div
                key={val}
                className="flex-1 rounded-t bg-gradient-to-t from-purple-400 to-purple-300"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>

          <p className="mt-3 text-xs text-dim">
            <span className="font-medium text-success">67% vested</span> · claimable now
          </p>
        </div>

        <div className="group w-80 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 p-5 text-white shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:-translate-y-1 dark:shadow-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <LuShield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">On-Chain Custody</div>
              <p className="text-xs text-purple-200">PDA vault · non-custodial</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-lg font-bold">MIT Licensed</span>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            <span className="text-xs text-purple-200">Open source</span>
          </div>
        </div>
      </div>
    </>
  );
}

export { HeroStatsCards };
