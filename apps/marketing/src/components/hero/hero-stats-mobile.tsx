import { LuBuilding2, LuCalendar, LuUsers } from "react-icons/lu";

const mobileStats = [
  {
    icon: LuBuilding2,
    label: "Acme Labs",
    value: "4 active grants",
    iconClass: "text-primary",
    iconBg: "bg-badge-purple",
  },
  {
    icon: LuCalendar,
    label: "Advisor Grant",
    value: "67% vested",
    iconClass: "text-success",
    iconBg: "bg-badge-green",
  },
  {
    icon: LuUsers,
    label: "Team Members",
    value: "No wallet needed",
    iconClass: "text-white",
    iconBg: "bg-gradient-to-br from-purple-600 to-purple-500",
  },
] as const;

function HeroStatsMobile() {
  return (
    <div className="mt-10 lg:hidden">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-w-[11.5rem] shrink-0 snap-start rounded-2xl border border-border bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${stat.iconClass}`} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-text">{stat.label}</div>
                  <p className="text-xs text-muted">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { HeroStatsMobile };
