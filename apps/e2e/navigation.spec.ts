import { test, expect } from "./fixtures";

test.describe("Dapp — Navigation", () => {
  test("loads the app without crashing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toBeAttached();
  });

  test("redirects to app from root", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toBeAttached({ timeout: 10_000 });
  });
});
