import { LuBan } from "react-icons/lu";

function CancelAnytimeCard() {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-7">
      {/* Gradient corner accent */}
      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-rose-500/10 to-orange-500/10 blur-2xl" />

      {/* Large XCircle watermark */}
      <LuBan className="absolute -bottom-6 -right-6 h-48 w-48 text-rose-500 opacity-10" />

      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
            <LuBan className="h-3.5 w-3.5" />
            CONTROL
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Cancel Anytime</h3>

          <p className="text-gray-500 dark:text-slate-400">
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
              <li
                key={point}
                className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300"
              >
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

export { CancelAnytimeCard };
