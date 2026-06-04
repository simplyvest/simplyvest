import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { renderWithRouter } from "@/__tests__/test-utils";
import { Features } from "@/components/marketing/features/features";

describe("Features", () => {
  it("renders section heading and tagline", async () => {
    renderWithRouter(<Features />);

    expect(await screen.findByText("Features")).toBeInTheDocument();
    expect(
      await screen.findByText(/Everything you need to build trustless vesting/),
    ).toBeInTheDocument();
  });

  it("renders all four feature cards", async () => {
    renderWithRouter(<Features />);

    expect(await screen.findByText("Linear Vesting")).toBeInTheDocument();
    expect(await screen.findByText("Milestone Payments")).toBeInTheDocument();
    expect(await screen.findByText("PDA Vaults")).toBeInTheDocument();
    expect(await screen.findByText("Cancel Anytime")).toBeInTheDocument();
  });

  it("renders feature badges", async () => {
    renderWithRouter(<Features />);

    expect(await screen.findByText("TIME-BASED")).toBeInTheDocument();
    expect(await screen.findByText("MILESTONE")).toBeInTheDocument();
    expect(await screen.findByText("NON-CUSTODIAL")).toBeInTheDocument();
    expect(await screen.findByText("CONTROL")).toBeInTheDocument();
  });
});
