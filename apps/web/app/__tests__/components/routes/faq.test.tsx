import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

// Mock the root route to avoid pulling in SolanaProvider → LedgerHQ chain
vi.mock("@/routes/__root", () => ({
  Route: { id: "__root", options: {} },
}));

import { Route as FaqRoute } from "@/routes/faq";
import { renderWithRouter } from "@/__tests__/test-utils";

const FAQPage = FaqRoute.options.component!;

describe("FAQPage", () => {
  it("renders the page heading and description", async () => {
    renderWithRouter(<FAQPage />);

    expect(
      await screen.findByText("Frequently Asked Questions"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Common questions about SimplyVest, token vesting, and the protocol.",
      ),
    ).toBeInTheDocument();
  });

  it("renders all eight FAQ questions", async () => {
    renderWithRouter(<FAQPage />);

    const questions = [
      "What is SimplyVest?",
      "How do I create a vesting stream?",
      "What's the difference between time-based and milestone vesting?",
      "Is SimplyVest custodial?",
      "Can I cancel a stream?",
      "What happens when a stream completes?",
      "Does SimplyVest charge fees?",
      "How do I get started?",
    ];

    for (const q of questions) {
      expect(await screen.findByText(q)).toBeInTheDocument();
    }
  });

  it("renders the CTA section with action links", async () => {
    renderWithRouter(<FAQPage />);

    expect(await screen.findByText("Still have questions?")).toBeInTheDocument();

    const docsLink = await screen.findByText("View Documentation");
    expect(docsLink.closest("a")).toHaveAttribute("href", "/docs");

    const communityLink = await screen.findByText("Join Community");
    expect(communityLink.closest("a")).toHaveAttribute("href", "/waitlist");
  });

  it("renders Navbar and Footer", async () => {
    renderWithRouter(<FAQPage />);

    // Navbar brand and Footer brand both render "SimplyVest"
    const brandTexts = await screen.findAllByText("SimplyVest");
    expect(brandTexts.length).toBeGreaterThanOrEqual(1);

    // Footer: copyright
    const year = new Date().getFullYear();
    expect(
      await screen.findByText(`© ${year} SimplyVest. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
