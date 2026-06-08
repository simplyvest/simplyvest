import { cn } from "@/utils/cn";

const CHAIN = import.meta.env.VITE_SOLANA_CHAIN ?? "solana:devnet";
const isDevnet = CHAIN.includes("devnet");

export function ChainBadge() {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isDevnet
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", isDevnet ? "bg-amber-500" : "bg-emerald-500")}
      />
      {isDevnet ? "Devnet" : "Mainnet"}
    </span>
  );
}
