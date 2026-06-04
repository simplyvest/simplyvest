import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { Navbar } from "@/components/layout/navbar";
import { renderWithRouter } from "@/__tests__/test-utils";

describe("Navbar", () => {
  it("renders the SimplyVest logo and brand name", async () => {
    renderWithRouter(<Navbar />);

    const logo = await screen.findByAltText("SimplyVest");
    expect(logo).toBeInTheDocument();

    const brandLink = await screen.findByText("SimplyVest");
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders all navigation links", async () => {
    renderWithRouter(<Navbar />);

    const expectedLinks = [
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs" },
      { label: "FAQ", href: "/faq" },
      { label: "Waitlist", href: "/waitlist" },
      { label: "App", href: "/app" },
    ];

    for (const { label, href } of expectedLinks) {
      const link = await screen.findByText(label);
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", href);
    }
  });
});
