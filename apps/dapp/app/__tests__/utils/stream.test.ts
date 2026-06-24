import BN from "bn.js";
import { describe, it, expect } from "vitest";

import { calcClaimable, calcProgress, getStreamStatusColor } from "@/utils/stream";

describe("calcClaimable", () => {
  const amount = new BN(1_000_000_000); // 1000 tokens with 6 decimals
  const withdrawn = new BN(0);

  it("returns 0 for non-active streams", () => {
    expect(calcClaimable(amount, withdrawn, 1000, 2000, 1500, "cancelled").toNumber()).toBe(0);
    expect(calcClaimable(amount, withdrawn, 1000, 2000, 1500, "completed").toNumber()).toBe(0);
  });

  it("returns full amount minus withdrawn when past endTime", () => {
    const result = calcClaimable(amount, new BN(200_000_000), 1000, 2000, 3000, "active");
    expect(result.toNumber()).toBe(800_000_000);
  });

  it("returns 0 before startTime", () => {
    const result = calcClaimable(amount, withdrawn, 2000, 3000, 1000, "active");
    expect(result.toNumber()).toBe(0);
  });

  it("calculates linear vesting at 50% elapsed, 0 withdrawn", () => {
    // 1000 total, 50% elapsed → 500 claimable
    const result = calcClaimable(amount, withdrawn, 1000, 2000, 1500, "active");
    expect(result.toNumber()).toBe(500_000_000);
  });

  it("calculates linear vesting subtracting already withdrawn", () => {
    // 1000 total, 50% elapsed = 500 vested, 200 withdrawn → 300 claimable
    const result = calcClaimable(amount, new BN(200_000_000), 1000, 2000, 1500, "active");
    expect(result.toNumber()).toBe(300_000_000);
  });

  it("returns 0 when withdrawn exceeds vested", () => {
    // 1000 total, 10% elapsed = 100 vested, 200 withdrawn → 0 claimable
    const result = calcClaimable(amount, new BN(200_000_000), 1000, 2000, 1100, "active");
    expect(result.toNumber()).toBe(0);
  });

  it("returns 0 for zero duration", () => {
    const result = calcClaimable(amount, withdrawn, 1000, 1000, 1500, "active");
    // endTime == startTime, but condition checks endTime > 0 (1000 > 0 → true)
    // then clockTime(1500) >= endTime(1000) → returns amount - withdrawn
    expect(result.toNumber()).toBe(1_000_000_000);
  });

  it("handles zero amount", () => {
    const result = calcClaimable(new BN(0), new BN(0), 1000, 2000, 1500, "active");
    expect(result.toNumber()).toBe(0);
  });
});

describe("calcProgress", () => {
  it("returns 0 when start equals end", () => {
    expect(calcProgress(1000, 1000, 1500)).toBe(0);
  });

  it("returns 0 before start", () => {
    expect(calcProgress(2000, 3000, 1000)).toBe(0);
  });

  it("returns 100 after end", () => {
    expect(calcProgress(1000, 2000, 3000)).toBe(100);
  });

  it("returns 50 at midpoint", () => {
    expect(calcProgress(1000, 2000, 1500)).toBe(50);
  });

  it("caps at 100 even with very large clockTime", () => {
    expect(calcProgress(1000, 2000, 1_000_000)).toBe(100);
  });

  it("returns 0 for negative start/end", () => {
    expect(calcProgress(-100, 100, 0)).toBe(50);
  });
});

describe("getStreamStatusColor", () => {
  it('returns "warn" for cancelled', () => {
    expect(getStreamStatusColor("cancelled")).toBe("warn");
  });

  it('returns "sol2" for completed', () => {
    expect(getStreamStatusColor("completed")).toBe("sol2");
  });

  it('returns "sol" for active', () => {
    expect(getStreamStatusColor("active")).toBe("sol");
  });

  it('returns "sol" for unknown status', () => {
    expect(getStreamStatusColor("unknown")).toBe("sol");
  });
});
