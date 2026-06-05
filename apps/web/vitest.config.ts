import path from "path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app"),
    },
  },
  optimizeDeps: {
    include: [
      "react-icons/lu",
      "@solana/wallet-adapter-react-ui",
      "@solana/wallet-adapter-react",
      "@solana/web3.js",
      "@solana/spl-token",
      "bn.js",
      "buffer",
    ],
  },
  test: {
    projects: [
      // Project 1: existing JSDom unit tests
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./app/__tests__/setup.ts"],
          exclude: ["**/*.stories.*", "**/node_modules/**"],
          deps: {
            inline: ["@ledgerhq/errors"],
          },
          css: true,
          execArgv: ["--localstorage-file", "/dev/null"],
        },
      },
      // Project 2: Storybook component tests in real browser
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          setupFiles: ["./app/__tests__/storybook-setup.ts"],
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
