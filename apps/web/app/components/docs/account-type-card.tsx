import { iconBg, iconText } from "./docs-data";

interface AccountTypeCardProps {
  color: "purple" | "green" | "blue" | "orange";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  monoLabel: string;
  description: string;
}

export function AccountTypeCard({
  color: c,
  icon: Icon,
  label,
  monoLabel,
  description,
}: AccountTypeCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative p-8">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg[c]}`}>
          <Icon className={`h-6 w-6 ${iconText[c]}`} />
        </div>
        <span className="mt-5 block font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400">
          {label}
        </span>
        <h3 className="mt-1 font-mono text-lg font-bold text-gray-900 dark:text-slate-100">
          {monoLabel}
        </h3>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-gray-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
