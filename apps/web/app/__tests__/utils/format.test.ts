import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { describe, it, expect } from "vitest";

import { formatAddress, formatSol, formatDate, formatDuration, clamp } from "@/utils/format";

describe("formatAddress", () => {
  it("truncates a PublicKey with default chars", () => {
    const pk = new PublicKey("6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk");
    expect(formatAddress(pk)).toBe("6Vkm...vECk");
  });

  it("truncates a string address with custom chars", () => {
    const addr = "6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk";
    expect(formatAddress(addr, 6)).toBe("6Vkmhx...AYvECk");
  });

  it("handles short addresses", () => {
    expect(formatAddress("abc", 2)).toBe("ab...bc");
  });
});

describe("formatSol", () => {
  it("formats lamports as SOL for BN input", () => {
    expect(formatSol(new BN(1_500_000_000), 9)).toBe("1.50");
  });

  it("formats lamports with custom decimals", () => {
    expect(formatSol(new BN(1_000_000), 6)).toBe("1.00");
  });

  it("handles number input", () => {
    expect(formatSol(2_000_000_000, 9)).toBe("2.00");
  });

  it("handles bigint input", () => {
    expect(formatSol(BigInt("500000000"), 9)).toBe("0.50");
  });

  it("shows more decimals for small amounts", () => {
    expect(formatSol(new BN(1), 9)).toBe("0.000000001");
  });
});

describe("formatDate", () => {
  it("formats a unix timestamp", () => {
    const result = formatDate(new BN(1700000000));
    expect(result).toContain("2023");
  });

  it("handles number input", () => {
    const result = formatDate(1700000000);
    expect(result).toBeTruthy();
  });
});

describe("formatDuration", () => {
  it("formats full duration", () => {
    expect(formatDuration(90061)).toBe("1d 1h 1m");
  });

  it("formats only hours and minutes", () => {
    expect(formatDuration(3661)).toBe("1h 1m");
  });

  it("formats only minutes", () => {
    expect(formatDuration(120)).toBe("2m");
  });

  it("formats zero as 0m", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  it("handles single day", () => {
    expect(formatDuration(86400)).toBe("1d");
  });
});

describe("clamp", () => {
  it("clamps above max", () => {
    expect(clamp(new BN(150), 0, 100)).toBe(100);
  });

  it("clamps below min", () => {
    expect(clamp(new BN(-10), 0, 100)).toBe(0);
  });

  it("returns value within range", () => {
    expect(clamp(new BN(50), 0, 100)).toBe(50);
  });
});
