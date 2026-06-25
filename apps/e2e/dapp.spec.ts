import { test, expect } from "./fixtures";

test.describe("Dapp — Public routes", () => {
  test("loads the app without crashing", async ({ page, takeScreenshot }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toBeAttached();
    await takeScreenshot("landing");
  });
});

test.describe("Dapp — Auth wall", () => {
  test("protected routes render without crashing", async ({ page, takeScreenshot }) => {
    await page.goto("/app/dashboard?tab=created");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("dashboard");
  });

  test("create stream page loads", async ({ page, takeScreenshot }) => {
    await page.goto("/app/create");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("create-stream");
  });

  test("help page loads", async ({ page, takeScreenshot }) => {
    await page.goto("/app/help");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
    await takeScreenshot("help");
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});
