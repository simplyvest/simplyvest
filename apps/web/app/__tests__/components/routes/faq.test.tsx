import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// Mock the root route to avoid pulling in SolanaProvider → LedgerHQ chain
vi.mock("@/routes/__root", () => ({
  Route: { id: "__root", options: {} },
}));

import { renderWithRouter } from "@/__tests__/test-utils";
import { Route as FaqRoute } from "@/routes/faq";

const component = FaqRoute.options.component;
if (!component) throw new Error("FAQ route missing component");
const FAQPage = component;

describe("FAQPage", () => {
  it("renders the page heading and description", async () => {
    renderWithRouter(<FAQPage />);

    expect(await screen.findByText("Frequently Asked Questions")).toBeInTheDocument();
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

    await Promise.all(
      questions.map(async (q) => {
        expect(await screen.findByText(q)).toBeInTheDocument();
      }),
    );
  });

  it("renders the CTA section with action links", async () => {
    renderWithRouter(<FAQPage />);

    expect(await screen.findByText("Still have questions?")).toBeInTheDocument();

    const docsLink = await screen.findByText("View Documentation");
    const expectedDocsUrl = import.meta.env.VITE_DOCS_URL ?? "https://docs.simplyvest.com";
    expect(docsLink.closest("a")).toHaveAttribute("href", expectedDocsUrl);

    const waitlistLink = await screen.findByText("Join Waitlist");
    expect(waitlistLink.closest("a")).toHaveAttribute("href", "/waitlist");
  });
});
