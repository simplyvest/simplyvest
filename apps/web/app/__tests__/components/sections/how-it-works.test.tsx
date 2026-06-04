import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { renderWithRouter } from "@/__tests__/test-utils";
import { HowItWorks } from "@/components/marketing/how-it-works/how-it-works";

describe("HowItWorks", () => {
  it("renders section heading and subtitle", async () => {
    renderWithRouter(<HowItWorks />);

    expect(await screen.findByText("How It Works")).toBeInTheDocument();
    expect(
      await screen.findByText("Three simple steps to create and manage token vesting on Solana."),
    ).toBeInTheDocument();
  });

  it("renders all three steps", async () => {
    renderWithRouter(<HowItWorks />);

    expect(await screen.findByText("Create Stream")).toBeInTheDocument();
    expect(await screen.findByText("Tokens Lock")).toBeInTheDocument();
    expect(await screen.findByText("Claim Unlocked")).toBeInTheDocument();
  });

  it("renders step numbers", async () => {
    renderWithRouter(<HowItWorks />);

    const step1 = await screen.findByText("Create Stream");
    expect(step1).toBeInTheDocument();
  });

  it("renders the bottom CTA tagline", async () => {
    renderWithRouter(<HowItWorks />);

    expect(await screen.findByText("Ready in minutes, secure forever")).toBeInTheDocument();
  });
});
