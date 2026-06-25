import { test, expect } from "./fixtures";

test.describe("Dapp — Navigation", () => {
  test("loads dashboard by default", async ({ page, takeScreenshot }) => {
    await page.goto("/");
    // Should land on dashboard (redirect from / to /app/dashboard?tab=created)
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("landing");
  });
});

test.describe("Dapp — Authenticated pages", () => {
  test("renders dashboard with stream tabs", async ({ page }) => {
    await page.goto("/app/dashboard?tab=created");
    await expect(page.getByText("Created")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Received")).toBeVisible({ timeout: 10_000 });
  });

  test("renders create page with stream type cards", async ({ page }) => {
    await page.goto("/app/create");
    await expect(page.getByRole("link", { name: /Linear/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: /Cliff/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: /Milestone/ })).toBeVisible({ timeout: 10_000 });
  });

  test("renders help page", async ({ page, takeScreenshot }) => {
    await page.goto("/app/help");
    // Check for help page content (sidebar or main area)
    await expect(page.getByText(/help/i).first()).toBeVisible({ timeout: 10_000 });
    await takeScreenshot("help");
  });

  test("renders settings page", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders profile page", async ({ page }) => {
    await page.goto("/app/profile");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders organizations page", async ({ page }) => {
    await page.goto("/app/organizations");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("renders tools page", async ({ page }) => {
    await page.goto("/app/tools");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});
