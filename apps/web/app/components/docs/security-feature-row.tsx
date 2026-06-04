import { hoverBg, leftAccentBar, iconBg, iconText } from "./docs-data";

interface SecurityFeatureRowProps {
  color: "purple" | "green" | "blue" | "orange";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function SecurityFeatureRow({
  color: c,
  icon: Icon,
  title,
  description,
}: SecurityFeatureRowProps) {
  return (
    <div
      className={`group/item relative flex items-start gap-5 rounded-2xl p-5 transition-colors duration-200 ${hoverBg[c]}`}
    >
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${leftAccentBar[c]}`} />
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg[c]}`}
      >
        <Icon className={`h-5 w-5 ${iconText[c]}`} />
      </div>
      <div className="min-w-0">
        <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-slate-100">{title}</h4>
        <p className="mt-1 text-[0.88rem] leading-relaxed text-gray-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
