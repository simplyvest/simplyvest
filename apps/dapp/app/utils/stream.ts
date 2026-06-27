import BN from "bn.js";

/**
 * Calculates the claimable amount for a linear vesting stream.
 * Returns a BN representing the tokens currently available to claim.
 * Returns 0 for non-active streams.
 */
export function calcClaimable(
  amount: BN,
  amountWithdrawn: BN,
  startTime: number,
  endTime: number,
  clockTime: number,
  status: string,
): BN {
  if (status !== "active" || endTime <= 0) {
    return new BN(0);
  }

  // Stream fully elapsed — everything is claimable
  if (clockTime >= endTime) {
    return amount.sub(amountWithdrawn);
  }

  // Before start — nothing claimable
  if (clockTime < startTime) {
    return new BN(0);
  }

  const elapsed = clockTime - startTime;
  const duration = endTime - startTime;

  if (duration <= 0) {
    return new BN(0);
  }

  // Linear vesting: vested = amount * elapsed / duration
  // Use BN .div() / .mul() instead of .divn() / .muln() because bn.js v5 limits
  // those to divisors/factors under ~67M — duration can exceed that for multi-year streams.
  const vested = amount.mul(new BN(elapsed)).div(new BN(duration));
  const claimable = vested.sub(amountWithdrawn);

  return claimable.lt(new BN(0)) ? new BN(0) : claimable;
}

/**
 * Calculates the progress percentage for a linear vesting stream.
 * Returns 0–100.
 */
export function calcProgress(startTime: number, endTime: number, clockTime: number): number {
  const totalSec = endTime - startTime;
  if (totalSec <= 0) return 0;

  const elapsedSec = Math.max(0, clockTime - startTime);
  return Math.min(100, (elapsedSec / totalSec) * 100);
}

/**
 * Maps a stream status string to the Badge variant used in StreamCard.
 */
export function getStreamStatusColor(status: string): "warn" | "sol2" | "sol" {
  if (status === "cancelled") return "warn";
  if (status === "completed") return "sol2";
  return "sol";
}
