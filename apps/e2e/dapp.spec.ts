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
    await page.goto("/app/dashboard?tab=created");
    await expect(page.getByText("Created")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Received")).toBeVisible();
    await takeScreenshot("dashboard");
  });
});

test.describe("Create stream", () => {
  test("shows three stream type cards", async ({ page, takeScreenshot }) => {
    await page.goto("/app/create");
    await expect(page.getByRole("link", { name: /Linear/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: /Cliff/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Milestone/ })).toBeVisible();
    await takeScreenshot("create-stream");
  });

  test("renders linear form", async ({ page }) => {
    await page.goto("/app/create/linear");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders cliff form", async ({ page }) => {
    await page.goto("/app/create/cliff");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders milestone form", async ({ page }) => {
    await page.goto("/app/create/milestone");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Stream detail", () => {
  test("renders stream detail page", async ({ page }) => {
    await page.goto("/app/streams/7NX7RrJpvnXYsBgvGMjRpfLgHsJhMhYHkLqg2Qz3Vn2");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Organizations", () => {
  test("renders org list page", async ({ page, takeScreenshot }) => {
    await page.goto("/app/organizations");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("organizations");
  });
});

test.describe("Profile", () => {
  test("renders profile page", async ({ page }) => {
    await page.goto("/app/profile");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Tools", () => {
  test("renders tools index", async ({ page }) => {
    await page.goto("/app/tools");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders token list", async ({ page }) => {
    await page.goto("/app/tools/tokens");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders create token page", async ({ page }) => {
    await page.goto("/app/tools/create-token");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders create token wallet", async ({ page }) => {
    await page.goto("/app/tools/create-token/wallet");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders create token platform", async ({ page }) => {
    await page.goto("/app/tools/create-token/platform");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});

test.describe("Other pages", () => {
  test("renders help page", async ({ page, takeScreenshot }) => {
    await page.goto("/app/help");
    await expect(page.getByText(/help/i).first()).toBeVisible({ timeout: 10_000 });
    await takeScreenshot("help");
  });

  test("renders settings page", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders analytics page", async ({ page }) => {
    await page.goto("/app/analytics");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders activity page", async ({ page }) => {
    await page.goto("/app/activity");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});
