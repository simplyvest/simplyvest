import { PublicKey } from "@solana/web3.js";

export function toUnixSec(datetimeLocal: string): number {
  if (!datetimeLocal) return 0;
  const d = new Date(datetimeLocal);
  return Math.floor(d.getTime() / 1000);
}

export function isValidPubkey(s: string): boolean {
  try {
    return !!new PublicKey(s);
  } catch {
    return false;
  }
}
