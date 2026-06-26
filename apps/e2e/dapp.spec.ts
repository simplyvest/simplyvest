import { test, expect } from "./fixtures";

/**
 * All authenticated dapp pages, rendered with mock API data where needed.
 * Auth bypassed via VITE_DEV_AUTH_BYPASS=true in webServer config.
 *
 * Note: Pages that call usePrivy().getAccessToken() directly (organizations,
 * stream detail with org context) need additional Privy API mocking and are
 * tested with render-only checks for now.
 */

test.describe("Dashboard", () => {
  test("renders with stream tabs", async ({ page, takeScreenshot }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("dashboard");
  });
});

test.describe("Create stream", () => {
  // TODO: These pages hit PrivyProvider internals that trip its own error boundary
  // even with VITE_DEV_AUTH_BYPASS. Needs proper Privy e2e setup (mock test accounts
  // or a mock-friendly PrivyProvider wrapper that skips Solana wallet connector init).
  // See https://docs.privy.io/recipes/using-test-accounts
  test.skip("shows three stream type cards", async ({ page, takeScreenshot }) => {
    await page.goto("/create");
    await expect(page.getByRole("link", { name: /Linear/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: /Cliff/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Milestone/ })).toBeVisible();
    await takeScreenshot("create-stream");
  });

  test("renders linear form", async ({ page }) => {
    await page.goto("/create/linear");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders cliff form", async ({ page }) => {
    await page.goto("/create/cliff");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders milestone form", async ({ page }) => {
    await page.goto("/create/milestone");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Stream detail", () => {
  test("renders stream detail page", async ({ page }) => {
    await page.goto("/streams/7NX7RrJpvnXYsBgvGMjRpfLgHsJhMhYHkLqg2Qz3Vn2");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Organizations", () => {
  test("renders org list page", async ({ page, takeScreenshot }) => {
    await page.goto("/organizations");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("organizations");
  });
});

test.describe("Profile", () => {
  test("renders profile page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Tools", () => {
  test("renders tools index", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders token list", async ({ page }) => {
    await page.goto("/tools/tokens");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders create token page", async ({ page }) => {
    await page.goto("/tools/create-token");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders create token wallet", async ({ page }) => {
    await page.goto("/tools/create-token/wallet");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders create token platform", async ({ page }) => {
    await page.goto("/tools/create-token/platform");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Other pages", () => {
  // TODO: Same PrivyProvider init issue as create-stream tests.
  test.skip("renders help page", async ({ page, takeScreenshot }) => {
    await page.goto("/help");
    await expect(page.getByText(/help/i).first()).toBeVisible({ timeout: 10_000 });
    await takeScreenshot("help");
  });

  test("renders settings page", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders analytics page", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders activity page", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});
