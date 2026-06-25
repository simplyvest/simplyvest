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
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/tanstack-react",
  refs: {
    "@simplyvest/ui": { disable: true },
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins?.push(tailwindcss());
    // Pre-optimize deps that cause Vite reloads mid-test.
    viteConfig.optimizeDeps ||= {};
    viteConfig.optimizeDeps.include = [
      ...(viteConfig.optimizeDeps.include || []),
      "react/jsx-dev-runtime",
    ];
    // storybook/test imports vitest 3.x from storybook's vendored deps.
    // Our project uses vitest 4.x. Excluding it from pre-bundling prevents
    // incompatible vitest versions from mixing in the Vite cache.
    viteConfig.optimizeDeps.exclude = [
      ...(viteConfig.optimizeDeps.exclude || []),
      "storybook/test",
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
    // Redirect Privy/Solana imports to storybook stubs so components
    // don't crash in the dev server (vi.mock only works in vitest CLI).
    alias.push(
      {
        find: "@privy-io/react-auth/solana",
        replacement: path.resolve(import.meta.dirname, "stubs/privy-solana.ts"),
      },
      {
        find: "@privy-io/react-auth",
        replacement: path.resolve(import.meta.dirname, "stubs/privy-react-auth.tsx"),
      },
    );
    viteConfig.resolve.alias = alias;
    return viteConfig;
  },
};

export default config;
