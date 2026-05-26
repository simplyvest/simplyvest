import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  testSequencer: "<rootDir>/tests/jest-sequencer.js",
  moduleNameMapper: {
    "^@solana-tdp/sdk$": "<rootDir>/../../packages/solana-tdp-sdk/src",
  },
};

export default config;
