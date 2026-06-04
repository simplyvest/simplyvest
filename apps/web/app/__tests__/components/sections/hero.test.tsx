import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { renderWithRouter } from "@/__tests__/test-utils";
import { Hero } from "@/components/sections/hero";

describe("Hero", () => {
  it("renders the badge and main heading", async () => {
    renderWithRouter(<Hero />);

    expect(await screen.findByText("Solana Vesting Protocol")).toBeInTheDocument();
    expect(await screen.findByText("SIMPLY")).toBeInTheDocument();
    expect(await screen.findByText("VEST")).toBeInTheDocument();
  });

  it("renders the tagline description", async () => {
    renderWithRouter(<Hero />);

    expect(
      await screen.findByText(
        "Non-custodial, programmable token vesting with time-based streams and milestone-gated releases on Solana.",
      ),
    ).toBeInTheDocument();
  });

  it("renders inline navigation links", async () => {
    renderWithRouter(<Hero />);

    const expectedLinks = [
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs" },
      { label: "FAQ", href: "/faq" },
      { label: "Waitlist", href: "/waitlist" },
      { label: "App", href: "/app" },
    ];

    await Promise.all(
      expectedLinks.map(async ({ label, href }) => {
        const link = await screen.findByText(label);
        expect(link.closest("a")).toHaveAttribute("href", href);
      }),
    );
  });

  it("renders CTA buttons with correct paths", async () => {
    renderWithRouter(<Hero />);

    const tryBeta = await screen.findByText("Try Beta App");
    expect(tryBeta.closest("a")).toHaveAttribute("href", "/app/dashboard?tab=created");

    const joinWaitlist = await screen.findByText("Join Waitlist");
    expect(joinWaitlist.closest("a")).toHaveAttribute("href", "/waitlist");

    const readDocs = await screen.findByText("Read Docs");
    expect(readDocs.closest("a")).toHaveAttribute("href", "/docs");
  });

  it("renders the SimplyVest logo", async () => {
    renderWithRouter(<Hero />);

    const logo = await screen.findByAltText("SimplyVest");
    expect(logo).toBeInTheDocument();
  });
});
