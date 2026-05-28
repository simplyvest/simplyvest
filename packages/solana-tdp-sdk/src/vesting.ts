import { BN } from "@coral-xyz/anchor";

import type { StreamAccount } from "./types/runtime";

export type StreamStatus = "active" | "completed" | "cancelled";

export const getStatus = (stream: StreamAccount): StreamStatus => {
  if (stream.cancelled) return "cancelled";
  if (stream.amountWithdrawn.eq(stream.amount)) return "completed";
  return "active";
};

export const getClaimable = (stream: StreamAccount, clockTime: number): BN => {
  if (stream.cancelled) return new BN(0);

  const now = new BN(clockTime);
  const start = stream.startTime;
  const end = stream.endTime;
  const cliff = stream.cliffTime;
  const amount = stream.amount;
  const withdrawn = stream.amountWithdrawn;

  if (now.lt(cliff)) return new BN(0);

  let vested: BN;
  if (now.gte(end)) {
    vested = amount;
  } else {
    const elapsed = now.sub(start);
    const duration = end.sub(start);
    vested = amount.mul(elapsed).div(duration);
    if (vested.gt(amount)) vested = amount;
  }

  const claimable = vested.sub(withdrawn);
  return claimable.gt(new BN(0)) ? claimable : new BN(0);
};

export const getVestedPercent = (stream: StreamAccount, clockTime: number): number => {
  const claimable = getClaimable(stream, clockTime);
  const withdrawn = stream.amountWithdrawn;
  const totalVested = withdrawn.add(claimable);

  if (stream.amount.eq(new BN(0))) return 0;
  return totalVested.mul(new BN(100)).div(stream.amount).toNumber();
};
