import path from "node:path";

import type { StorybookConfig } from "@storybook/tanstack-react";

const config: StorybookConfig = {
  stories: [
    "../app/components/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../app/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@chromatic-com/storybook", "@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/tanstack-react",
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ||= {};
    viteConfig.resolve.alias ||= [];
    // @ alias matching app's vite.config.ts
    const alias = Array.isArray(viteConfig.resolve.alias) ? viteConfig.resolve.alias : [];
    alias.push({
      find: "@",
      replacement: path.resolve(import.meta.dirname, "../app"),
    });
    viteConfig.resolve.alias = alias;
    return viteConfig;
  },
};

export default config;
