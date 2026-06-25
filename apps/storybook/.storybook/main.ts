import path from "node:path";

import type { StorybookConfig } from "@storybook/tanstack-react";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../dapp/app/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../marketing/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
  ],
  framework: "@storybook/tanstack-react",
  viteFinal: async (viteConfig) => {
    viteConfig.plugins?.push(tailwindcss());
    // Pre-optimize deps that cause Vite reloads mid-test.
    // Filter unresolvable deps (Storybook plugin adds internal deps like
    // @tanstack/react-store that can't resolve from monorepo project root).
    viteConfig.optimizeDeps ||= {};
    viteConfig.optimizeDeps.include = [
      ...(viteConfig.optimizeDeps.include || []).filter(
        (d: string) =>
          !d.includes("tanstack") &&
          !d.includes("use-sync-external-store") &&
          d !== "@storybook/addon-vitest",
      ),
      "react/jsx-dev-runtime",
    ];
    viteConfig.resolve ||= {};
    viteConfig.resolve.alias ||= [];
    const alias = Array.isArray(viteConfig.resolve.alias) ? viteConfig.resolve.alias : [];
    // More-specific @/.storybook alias must come before @ to match first
    alias.push({
      find: "@/.storybook",
      replacement: path.resolve(import.meta.dirname, "."),
    });
    // Resolve @/ imports to apps/dapp/app/ (where the components live)
    alias.push({
      find: "@",
      replacement: path.resolve(import.meta.dirname, "../../dapp/app"),
    });
    viteConfig.resolve.alias = alias;
    return viteConfig;
  },
};

export default config;
