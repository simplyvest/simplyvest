import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app"),
    },
  },
  test: {
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
});
