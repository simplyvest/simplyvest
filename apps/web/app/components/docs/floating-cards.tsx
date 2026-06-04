import { LuFileText, LuDatabase, LuCoins } from "react-icons/lu";

export function FloatingCards() {
  return (
    <div className="relative mt-16 hidden lg:mt-0 lg:flex lg:flex-col lg:items-center lg:justify-center">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="docs-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M200 128 L200 168"
          stroke="url(#docs-line)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        <path
          d="M200 288 L200 328"
          stroke="url(#docs-line)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      </svg>

      <div className="flex flex-col items-center gap-8">
        <div
          className="w-72 rounded-2xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:scale-105"
          style={{ transform: "rotate(3deg)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
              <LuFileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                Documentation
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Protocol Reference</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div className="h-full w-3/4 rounded-full bg-purple-200 dark:bg-purple-800" />
            </div>
            <div className="h-2 w-5/6 rounded-full bg-gray-100">
              <div className="h-full w-1/2 rounded-full bg-purple-100 dark:bg-purple-900" />
            </div>
          </div>
        </div>

        <div
          className="w-72 rounded-2xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:scale-105"
          style={{ transform: "rotate(-3deg)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <LuDatabase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                Account Model
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">On-chain State</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div className="h-full w-2/3 rounded-full bg-blue-200" />
            </div>
            <div className="h-2 w-4/6 rounded-full bg-gray-100">
              <div className="h-full w-3/5 rounded-full bg-blue-100" />
            </div>
          </div>
        </div>

        <div className="w-72 overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-600 to-purple-500 p-5 shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <LuCoins className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Token Streams</h3>
                <p className="text-xs text-purple-200">SPL &amp; Token-2022</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex rounded-full bg-white/20 px-3 py-0.5 font-mono text-[0.65rem] font-medium text-white">
              SOLANA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
