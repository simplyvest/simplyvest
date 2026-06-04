import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { UseCases } from "@/components/sections/use-cases";
import { renderWithRouter } from "@/__tests__/test-utils";

describe("UseCases", () => {
  it("renders section heading and subtitle", async () => {
    renderWithRouter(<UseCases />);

    expect(await screen.findByText("Use Cases")).toBeInTheDocument();
    expect(
      await screen.findByText(/From team compensation to milestone-based payments/),
    ).toBeInTheDocument();
  });

  it("renders all three use case cards", async () => {
    renderWithRouter(<UseCases />);

    expect(await screen.findByText("TEAM VESTING")).toBeInTheDocument();
    expect(await screen.findByText("MILESTONE PAYMENTS")).toBeInTheDocument();

    // "Self vesting" is for individual token holders
    expect(await screen.findByText("SELF-VESTING")).toBeInTheDocument();
  });

  it("renders feature lists for each card", async () => {
    renderWithRouter(<UseCases />);

    // Team vesting features
    expect(await screen.findByText("Employee token grants")).toBeInTheDocument();
    expect(await screen.findByText("Advisor compensation")).toBeInTheDocument();

    // Milestone payment features
    expect(await screen.findByText("Condition-based releases")).toBeInTheDocument();
    expect(await screen.findByText("Custom milestone criteria")).toBeInTheDocument();
  });
});
