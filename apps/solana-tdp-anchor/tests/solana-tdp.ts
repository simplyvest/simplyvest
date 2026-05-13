import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";

describe("solana-tdp", () => {
  it("compilation check: package loads and test runs", async () => {
    expect(anchor).to.not.be.undefined;
    console.log("Requirement check: Test passing.");
  });
});
