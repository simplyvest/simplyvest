import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { renderWithRouter } from "@/__tests__/test-utils";
import { Navbar } from "@/components/layout/navbar";

vi.mock("@/lib/solana/use-auth", () => ({
  useAuth: () => ({
    connected: false,
    connecting: false,
    publicKey: null,
    user: null,
  }),
}));

vi.mock("@privy-io/react-auth", () => ({
  useLogin: () => ({ login: () => {} }),
  useLogout: () => ({ logout: () => {} }),
}));

describe("Navbar", () => {
  it("renders the SimplyVest logo and brand name", async () => {
    renderWithRouter(<Navbar />);

    const logo = await screen.findByAltText("SimplyVest");
    expect(logo).toBeInTheDocument();

    const brandLink = await screen.findByText("SimplyVest");
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders public navigation links on marketing pages", async () => {
    renderWithRouter(<Navbar />);

    const expectedLinks = [
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs" },
      { label: "FAQ", href: "/faq" },
      { label: "Beta App", href: "/app" },
      { label: "Waitlist", href: "/waitlist" },
    ];

    await Promise.all(
      expectedLinks.map(async ({ label, href }) => {
        const link = await screen.findByText(label);
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute("href", href);
      }),
    );
  });

  it("does not render app-specific links on marketing pages", async () => {
    renderWithRouter(<Navbar />);

    // Wait for Navbar to render, then confirm app links are absent
    await screen.findByText("Home");
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Stream")).not.toBeInTheDocument();
  });
});
