import { accentBar, iconBg, iconText, bulletColor } from "./docs-data";

interface StreamTypeCardProps {
  color: "purple" | "green" | "blue" | "orange";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  description: string;
  points: readonly string[];
}

export function StreamTypeCard({
  color: c,
  icon: Icon,
  label,
  title,
  description,
  points,
}: StreamTypeCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className={`h-1 w-full ${accentBar[c]}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative p-8">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg[c]}`}>
            <Icon className={`h-5 w-5 ${iconText[c]}`} />
          </div>
          <span
            className={`font-mono text-[0.68rem] font-semibold uppercase tracking-widest ${c === "purple" ? "text-purple-600 dark:text-purple-400" : "text-emerald-700 dark:text-emerald-400"}`}
          >
            {label}
          </span>
        </div>
        <h3 className="mt-4 font-mono text-xl font-bold text-gray-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-gray-500 dark:text-slate-400">
          {description}
        </p>
        <ul className="mt-6 space-y-2.5">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300"
            >
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${bulletColor[c]}`} />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
