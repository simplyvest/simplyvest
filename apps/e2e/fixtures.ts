import { existsSync, mkdirSync } from "node:fs";

import { test as base } from "@playwright/test";

/**
 * Playwright fixture that captures full-page screenshots for docs.
 * Gated by SCREENSHOTS=true env var — disabled by default for speed.
 * Saves to apps/docs/public/screenshots/ (served by Astro docs site).
 *
 * Usage: SCREENSHOTS=true pnpm test:e2e
 */
export const test = base.extend<{
  takeScreenshot: (name: string) => Promise<void>;
}>({
  takeScreenshot: async ({ page }, use) => {
    await use(async (name: string) => {
      if (process.env["SCREENSHOTS"] !== "true") return;
      const dir = "../docs/public/screenshots";
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      await page.screenshot({
        path: `${dir}/${name}.png`,
        fullPage: true,
      });
    });
  },
});

export { expect } from "@playwright/test";
