import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@solana-tdp/sdk": path.resolve(import.meta.dirname, "../../packages/solana-tdp-sdk/src"),
    },
  },
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    sequence: {
      shuffle: false,
    },
    pool: "forks",
    singleFork: true,
  },
});
