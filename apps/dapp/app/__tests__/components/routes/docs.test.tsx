import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock the root route to avoid pulling in SolanaProvider → LedgerHQ chain
vi.mock("@/routes/__root", () => ({
  Route: { id: "__root", options: {} },
}));

import { renderWithRouter } from "@/__tests__/test-utils";
import { Route as DocsRoute } from "@/routes/docs";

const component = DocsRoute.options.component;
if (!component) throw new Error("Docs route missing component");
const DocsPage = component;

describe("DocsPage", () => {
  it("renders a redirect link to the external docs site", async () => {
    renderWithRouter(<DocsPage />);

    const expectedDocsUrl = import.meta.env.VITE_DOCS_URL ?? "https://docs.simplyvest.com";
    const redirectLink = await screen.findByText("SimplyVest Docs");
    expect(redirectLink).toBeInTheDocument();
    expect(redirectLink.closest("a")).toHaveAttribute("href", expectedDocsUrl);
    expect(await screen.findByText(/Redirecting/)).toBeInTheDocument();
  });

  it("redirects to the external docs URL", async () => {
    const expectedDocsUrl = import.meta.env.VITE_DOCS_URL ?? "https://docs.simplyvest.com";
    // window.location.href is set in useEffect
    const originalLocation = window.location;
    const mockLocation = Object.assign({}, originalLocation, { href: "" });
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    renderWithRouter(<DocsPage />);

    // Wait for the effect to fire
    await waitFor(() => {
      expect(window.location.href).toBe(expectedDocsUrl);
    });

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });
});
