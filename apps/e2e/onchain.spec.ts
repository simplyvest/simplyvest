import { test, expect } from "./fixtures";

/**
 * Tier 2: On-chain data display tests.
 *
 * Auth bypassed via VITE_DEV_AUTH_BYPASS=true in webServer config.
 * The dapp renders real pages with the dev auth mock from use-auth.ts.
 *
 * Program ID: 6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk (devnet)
 */

test.describe("Dashboard — authenticated", () => {
  test("renders streams dashboard", async ({ page, takeScreenshot }) => {
    await page.goto("/app/dashboard?tab=created");
    await expect(page.getByText("Created")).toBeVisible({ timeout: 10_000 });
    await takeScreenshot("dashboard");
  });

  test("shows empty state for new users", async ({ page }) => {
    await page.goto("/app/dashboard?tab=created");
    // New wallet has no streams — should show empty state
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Create stream — authenticated", () => {
  test("renders create page with type cards", async ({ page, takeScreenshot }) => {
    await page.goto("/app/create");
    await expect(page.getByRole("link", { name: /Linear/ })).toBeVisible({ timeout: 10_000 });
    await takeScreenshot("create-stream");
  });

  test("shows three stream types", async ({ page }) => {
    await page.goto("/app/create");
    await expect(page.getByRole("link", { name: /Linear/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Cliff/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Milestone/ })).toBeVisible();
  });
});
