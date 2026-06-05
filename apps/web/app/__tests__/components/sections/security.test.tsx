import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { renderWithRouter } from "@/__tests__/test-utils";
import { Security } from "@/components/marketing/security/security";

describe("Security", () => {
  it("renders section heading and description", async () => {
    renderWithRouter(<Security />);

    expect(await screen.findByText("Trust & Security")).toBeInTheDocument();
    expect(
      await screen.findByText(/Security-first architecture with verifiable guarantees/),
    ).toBeInTheDocument();
  });

  it("renders the status indicator", async () => {
    renderWithRouter(<Security />);

    expect(await screen.findByText("All Systems Secure")).toBeInTheDocument();
    expect(await screen.findByText("Audited")).toBeInTheDocument();
    expect(await screen.findByText("SECURITY_LEVEL: MAX")).toBeInTheDocument();
  });

  it("renders all four security features", async () => {
    renderWithRouter(<Security />);

    // Vaults appears as both a label span and an h3 heading
    const vaultElements = await screen.findAllByText("Vaults");
    expect(vaultElements.length).toBeGreaterThanOrEqual(1);
    // These titles appear twice each (label span + h3 heading)
    const rentRecoveryElements = await screen.findAllByText("Rent Recovery");
    expect(rentRecoveryElements.length).toBeGreaterThanOrEqual(1);
    const openSourceElements = await screen.findAllByText("Open Source");
    expect(openSourceElements.length).toBeGreaterThanOrEqual(1);
    const protocolFeesElements = await screen.findAllByText("Protocol Fees");
    expect(protocolFeesElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders footer metrics", async () => {
    renderWithRouter(<Security />);

    expect(await screen.findByText("Audited Smart Contracts")).toBeInTheDocument();
    expect(await screen.findByText("Non-Custodial Architecture")).toBeInTheDocument();
    expect(await screen.findByText("Community Verified")).toBeInTheDocument();
  });
});
