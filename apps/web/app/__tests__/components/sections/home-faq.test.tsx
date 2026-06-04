import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import { renderWithRouter } from "@/__tests__/test-utils";
import { HomeFAQ } from "@/components/marketing/home-faq/home-faq";

describe("HomeFAQ", () => {
  it("renders section heading", async () => {
    renderWithRouter(<HomeFAQ />);

    expect(await screen.findByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("renders all seven questions", async () => {
    renderWithRouter(<HomeFAQ />);

    const questions = [
      "What is SimplyVest?",
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

  it("opens an answer when clicking a question", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomeFAQ />);
    // Wait for the component to render before checking absence
    await screen.findByText("What is SimplyVest?");
    // Initially no answer is visible
    expect(
      screen.queryByText(/SimplyVest is a non-custodial token vesting protocol on Solana/),
    ).not.toBeInTheDocument();

    // Click the first question
    await user.click(await screen.findByText("What is SimplyVest?"));

    // Answer should now be visible
    expect(
      await screen.findByText(/SimplyVest is a non-custodial token vesting protocol on Solana/),
    ).toBeInTheDocument();
  });

  it("closes an answer when clicking the same question again", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomeFAQ />);

    // Open
    await user.click(await screen.findByText("What is SimplyVest?"));
    expect(
      await screen.findByText(/SimplyVest is a non-custodial token vesting protocol on Solana/),
    ).toBeInTheDocument();

    // Close by clicking again
    await user.click(await screen.findByText("What is SimplyVest?"));
    expect(
      screen.queryByText(/SimplyVest is a non-custodial token vesting protocol on Solana/),
    ).not.toBeInTheDocument();
  });

  it("renders the View full FAQ link", async () => {
    renderWithRouter(<HomeFAQ />);

    const link = await screen.findByText("View full FAQ");
    expect(link.closest("a")).toHaveAttribute("href", "/faq");
  });
});
