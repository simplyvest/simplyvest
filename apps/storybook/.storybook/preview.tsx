import { Buffer } from "buffer";

import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/tanstack-react";

import "../../dapp/app/styles.css";
import { withProviders } from "./decorators";

// Polyfill Buffer for @solana/spl-token in the browser
if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}

// Shim vi for story files that use vi.mock (no-op in dev server)
if (typeof globalThis.vi === "undefined") {
  globalThis.vi = { mock: () => {}, fn: () => {}, __esModule: true } as const;
}

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "dark",
    }),
    withProviders,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Run automatically (set manual:true to only check on demand)
      manual: false,
      config: {
        rules: [
          // SVG decorative elements often trigger false positives for
          // accessible-name checks. This project uses many inline SVGs
          // for background decorations and patterns.
          { id: "svg-img-alt", enabled: false },
          // The color-contrast rule is useful but can be noisy in
          // development. Keep enabled by default; disable per-story
          // when intentional low-contrast designs are used.
        ],
      },
    },
  },
};

export default preview;
