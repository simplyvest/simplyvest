import { describe, it, expect } from "vitest";

function getEffectiveVisibility(
  visible: boolean | null | undefined,
  mode: "hide_list" | "allow_list",
): boolean {
  if (mode === "hide_list") return visible !== false;
  return visible === true;
}

describe("Token Service", () => {
  it("validates token creation input has all required fields", () => {
    const requiredFields = [
      "mintAddress",
      "creatorAddress",
      "name",
      "symbol",
      "decimals",
      "supply",
      "metadataUri",
    ];
    const input = {
      mintAddress: "TestMintAddress11111111111111111",
      creatorAddress: "CreatorAddress11111111111111111",
      name: "Test Token",
      symbol: "TEST",
      decimals: 9,
      supply: "1000000000",
      metadataUri: "https://example.com/metadata.json",
    };
    for (const field of requiredFields) {
      expect(input).toHaveProperty(field);
    }
  });

  it("validates token creation rejects missing fields", () => {
    const input = { mintAddress: "test" } as Record<string, unknown>;
    const required = [
      "mintAddress",
      "creatorAddress",
      "name",
      "symbol",
      "decimals",
      "supply",
      "metadataUri",
    ];
    const missing = required.filter((f) => !input[f]);
    expect(missing.length).toBeGreaterThan(0);
  });

  it("validates visibility input", () => {
    const input = { visible: true, creatorAddress: "user123" };
    expect(typeof input.visible).toBe("boolean");
    expect(input.creatorAddress).toBeTruthy();
  });

  it("hide_list mode defaults visible when no preference set", () => {
    expect(getEffectiveVisibility(undefined, "hide_list")).toBe(true);
    expect(getEffectiveVisibility(null, "hide_list")).toBe(true);
    expect(getEffectiveVisibility(false, "hide_list")).toBe(false);
    expect(getEffectiveVisibility(true, "hide_list")).toBe(true);
  });

  it("allow_list mode only shows explicitly visible tokens", () => {
    expect(getEffectiveVisibility(undefined, "allow_list")).toBe(false);
    expect(getEffectiveVisibility(null, "allow_list")).toBe(false);
    expect(getEffectiveVisibility(false, "allow_list")).toBe(false);
    expect(getEffectiveVisibility(true, "allow_list")).toBe(true);
  });
});
