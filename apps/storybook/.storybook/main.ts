import path from "node:path";

import type { StorybookConfig } from "@storybook/tanstack-react";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: [
    "../../web/app/components/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../web/app/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@chromatic-com/storybook", "@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/tanstack-react",
  viteFinal: async (viteConfig) => {
    viteConfig.plugins?.push(tailwindcss());
    viteConfig.resolve ||= {};
    viteConfig.resolve.alias ||= [];
    const alias = Array.isArray(viteConfig.resolve.alias) ? viteConfig.resolve.alias : [];
    // More-specific @/.storybook alias must come before @ to match first
    alias.push({
      find: "@/.storybook",
      replacement: path.resolve(import.meta.dirname, "."),
    });
    // Resolve @/ imports to apps/web/app/ (where the components live)
    alias.push({
      find: "@",
      replacement: path.resolve(import.meta.dirname, "../../web/app"),
    });
    viteConfig.resolve.alias = alias;
    return viteConfig;
  },
};

export default config;
