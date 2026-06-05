import { LuFlag } from "react-icons/lu";

function MilestonePaymentsCard() {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg md:col-span-5">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
          <LuFlag className="h-3.5 w-3.5" />
          MILESTONE
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Milestone Payments</h3>

        <p className="text-gray-500 dark:text-slate-400">
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
            <li
              key={point}
              className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300"
            >
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
                    : "border-2 border-emerald-300 bg-white dark:bg-slate-900"
                }`}
              >
                <LuFlag className={`h-3.5 w-3.5 ${i === 2 ? "text-white" : "text-emerald-500"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { MilestonePaymentsCard };
