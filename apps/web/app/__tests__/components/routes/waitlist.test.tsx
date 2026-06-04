import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

// Mock the root route to avoid pulling in SolanaProvider → LedgerHQ chain
vi.mock("@/routes/__root", () => ({
  Route: { id: "__root", options: {} },
}));
// Mock fetch for waitlist API submission — return success by default
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ ok: true }),
});

import { renderWithRouter } from "@/__tests__/test-utils";
import { Route as WaitlistRoute } from "@/routes/waitlist";

const component = WaitlistRoute.options.component;
if (!component) throw new Error("Waitlist route missing component");
const WaitlistPage = component;

describe("WaitlistPage", () => {
  it("renders the page heading and description", async () => {
    renderWithRouter(<WaitlistPage />);

    expect(await screen.findByText("Waitlist SimplyVest")).toBeInTheDocument();
    expect(
      await screen.findByText(/We help you transfer your money in a safer way/),
    ).toBeInTheDocument();
  });

  it("renders all form fields", async () => {
    renderWithRouter(<WaitlistPage />);

    // Use getAllByRole to find textboxes and select, then check labels
    const textboxes = await screen.findAllByRole("textbox");
    expect(textboxes).toHaveLength(3);

    // Telegram ID is not a textbox (it's a text input without that role in some implementations)
    const nameInput = screen.getByRole("textbox", { name: /Your Name/ });
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", { name: /Email/ });
    expect(emailInput).toBeInTheDocument();

    expect(
      screen.getByText(/I'm willing to be contacted for a user interview/),
    ).toBeInTheDocument();
  });

  it("renders required field indicators", async () => {
    renderWithRouter(<WaitlistPage />);

    const requiredLabels = await screen.findAllByText("*");
    expect(requiredLabels.length).toBeGreaterThanOrEqual(3);
  });

  it("renders the submit button", async () => {
    renderWithRouter(<WaitlistPage />);

    expect(await screen.findByRole("button", { name: /Join Waitlist/ })).toBeInTheDocument();
  });

  it("renders privacy notice", async () => {
    renderWithRouter(<WaitlistPage />);

    expect(await screen.findByText(/We respect your privacy/)).toBeInTheDocument();
  });

  it("shows success state after form submission", async () => {
    const user = userEvent.setup();
    renderWithRouter(<WaitlistPage />);

    // Fill required fields
    await user.type(await screen.findByRole("textbox", { name: /Your Name/ }), "Test User");
    await user.type(await screen.findByRole("textbox", { name: /Email/ }), "test@example.com");
    await user.type(await screen.findByLabelText(/Telegram ID/), "@testuser");

    // Submit
    await user.click(await screen.findByRole("button", { name: /Join Waitlist/ }));

    // Success state
    expect(await screen.findByText("You're on the list!")).toBeInTheDocument();
    expect(await screen.findByText(/Thank you for signing up/)).toBeInTheDocument();
  });

  it("renders Navbar and Footer", async () => {
    renderWithRouter(<WaitlistPage />);

    // Navbar brand and Footer brand both render "SimplyVest"
    const brandTexts = await screen.findAllByText("SimplyVest");
    expect(brandTexts.length).toBeGreaterThanOrEqual(1);

    // Footer: copyright present
    const year = new Date().getFullYear();
    expect(
      await screen.findByText(`© ${year} SimplyVest. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
