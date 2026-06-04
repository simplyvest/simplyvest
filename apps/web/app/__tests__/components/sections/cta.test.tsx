import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { renderWithRouter } from "@/__tests__/test-utils";
import { CTA } from "@/components/marketing/cta/cta";

describe("CTA", () => {
  it("renders heading and description", async () => {
    renderWithRouter(<CTA />);

    expect(await screen.findByText("Start Vesting Today")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Join the waitlist to be the first to know when SimplyVest launches.",
      ),
    ).toBeInTheDocument();
  });

  it("renders waitlist link with correct path", async () => {
    renderWithRouter(<CTA />);

    const link = await screen.findByText("Join Waitlist");
    expect(link.closest("a")).toHaveAttribute("href", "/waitlist");
  });

  it("renders trust indicators", async () => {
    renderWithRouter(<CTA />);

    expect(await screen.findByText("No credit card required")).toBeInTheDocument();
    expect(await screen.findByText("Launch in Q2 2026")).toBeInTheDocument();
  });
});
