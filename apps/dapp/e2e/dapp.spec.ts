import { test, expect } from "./fixtures";

test.describe("Dapp — Public routes", () => {
  test("loads the app without crashing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toBeAttached();
  });
});

test.describe("Dapp — Auth wall", () => {
  test("protected routes render without crashing", async ({ page }) => {
    await page.goto("/app/dashboard?tab=created");
    // The app should render even when unauthenticated
    // (Privy shows its login UI inside the app)
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("create stream page loads", async ({ page }) => {
    await page.goto("/app/create");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("help page loads", async ({ page }) => {
    await page.goto("/app/help");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});
