import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// Mock the root route to avoid pulling in SolanaProvider → LedgerHQ chain
vi.mock("@/routes/__root", () => ({
  Route: { id: "__root", options: {} },
}));

import { renderWithRouter } from "@/__tests__/test-utils";
import { Route as DocsRoute } from "@/routes/docs";

const component = DocsRoute.options.component;
if (!component) throw new Error("Docs route missing component");
const DocsPage = component;

describe("DocsPage", () => {
  it("renders the hero heading and tagline", async () => {
    renderWithRouter(<DocsPage />);

    expect(await screen.findByText("DOCS")).toBeInTheDocument();
    expect(await screen.findByText("OVERVIEW")).toBeInTheDocument();
    expect(
      await screen.findByText(/non-custodial, on-chain SPL-token vesting/),
    ).toBeInTheDocument();
  });

  it("renders the Stream Types section", async () => {
    renderWithRouter(<DocsPage />);

    expect(await screen.findByText("Stream Types")).toBeInTheDocument();
    expect(
      await screen.findByText("Two types of vesting streams for different distribution models."),
    ).toBeInTheDocument();

    // Stream type cards
    expect(await screen.findByText("STREAMACCOUNT")).toBeInTheDocument();
    expect(await screen.findByText("MILESTONESTREAM")).toBeInTheDocument();
  });

  it("renders the Account Model section", async () => {
    renderWithRouter(<DocsPage />);

    const accountModelTexts = await screen.findAllByText("Account Model");
    expect(accountModelTexts.length).toBeGreaterThanOrEqual(1);
    expect(
      await screen.findByText("Three on-chain account types power the protocol."),
    ).toBeInTheDocument();

    // Account cards
    expect(await screen.findByText("StreamAccount")).toBeInTheDocument();
    expect(await screen.findByText("VaultAccount")).toBeInTheDocument();
    expect(await screen.findByText("CreatorConfig")).toBeInTheDocument();
  });

  it("renders the Security Model section", async () => {
    renderWithRouter(<DocsPage />);

    expect(await screen.findByText("Security Model")).toBeInTheDocument();
    expect(await screen.findByText("Key security properties of the protocol.")).toBeInTheDocument();

    // Security features
    expect(await screen.findByText("PDA Vaults")).toBeInTheDocument();
    expect(await screen.findByText("Recipient Commitment")).toBeInTheDocument();
    expect(await screen.findByText("Rent Recovery")).toBeInTheDocument();
    expect(await screen.findByText("Token-2022")).toBeInTheDocument();
  });

  it("renders Navbar and Footer", async () => {
    renderWithRouter(<DocsPage />);

    const brandTexts = await screen.findAllByText("SimplyVest");
    expect(brandTexts.length).toBeGreaterThanOrEqual(1);

    const year = new Date().getFullYear();
    expect(
      await screen.findByText(`© ${year} SimplyVest. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
