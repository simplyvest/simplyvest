import { createRequire } from "module";
import path from "path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(new URL(import.meta.url).pathname);

// @vitejs/plugin-react handles react-dom CJS interop (required for browser mode per
// https://vitest.dev/guide/browser/#configuration).
//
// The alias below works around a React packaging limitation tracked at
// https://github.com/facebook/react/issues/24590. The `use-sync-external-store`
// shim re-exports its CJS build via `module.exports = require(...)`. Vite's CJS
// converter cannot follow that chain to detect named exports, so we point directly
// at the source file that has detectable `exports.foo = ...` assignments.
const moduleRequire = createRequire(import.meta.url);
const uSesRoot = path.dirname(moduleRequire.resolve("use-sync-external-store/package.json"));

export default defineConfig({
  plugins: [
    react(),
    storybookTest({
      configDir: path.join(dirname, ".storybook"),
    }),
  ],
  resolve: {
    alias: {
      "use-sync-external-store/shim/with-selector": path.join(
        uSesRoot,
        "cjs/use-sync-external-store-shim/with-selector.development.js",
      ),
    },
  },
  // Prevent Vite from discovering and optimizing dependencies during test
  // execution, which triggers a reload that kills the Vitest runner.
  // This is the documented fix for "Vitest failed to find the runner" on
  // cold-cache runs. See: storybookjs/storybook#31599, #33067, #32049.
  optimizeDeps: {
    include: ["react/jsx-dev-runtime", "react-icons", "react-icons/lu"],
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright({}),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
