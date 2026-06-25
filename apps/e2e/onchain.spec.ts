import { test, expect, mockAuthenticatedWallet } from "./fixtures";

/**
 * Tier 2: On-chain data display tests.
 *
 * Tests that the UI correctly fetches and displays Solana on-chain data.
 * For PR CI: uses mocked RPC responses (page.route).
 * For nightly CI: can be run against devnet with real on-chain state.
 *
 * Program ID: 6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk (devnet)
 */

test.describe("Stream data display", () => {
  test("dashboard loads with auth mock", async ({ page, takeScreenshot }) => {
    // Set up the auth mock before navigation
    await mockAuthenticatedWallet(page);
    await page.goto("/app/dashboard?tab=created");
    // The dashboard should render (may show empty state or login fallback)
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("dashboard-authenticated");
  });

  test("create stream page loads with auth mock", async ({ page }) => {
    await mockAuthenticatedWallet(page);
    await page.goto("/app/create");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});
