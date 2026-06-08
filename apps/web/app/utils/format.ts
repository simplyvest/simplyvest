import BN from "bn.js";
export const formatSol = (lamports: BN | number | bigint, decimals = 9): string => {
  const n = typeof lamports === "number" ? lamports : Number(lamports);
  const precision = Math.max(0, Math.min(20, Math.round(decimals)));
  const minFrac = Math.min(2, precision);
  return (n / 10 ** decimals).toLocaleString(undefined, {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: precision,
  });
};

export const formatDate = (unix: BN | number): string => {
  const ts = typeof unix === "number" ? unix : unix.toNumber();
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0) parts.push("0m");
  return parts.join(" ");
};

export const clamp = (value: BN | number, min: number, max: number): number => {
  const n = typeof value === "number" ? value : value.toNumber();
  return Math.max(min, Math.min(max, n));
};
