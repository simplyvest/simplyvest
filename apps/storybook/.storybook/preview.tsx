import { Buffer } from "buffer";

import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/tanstack-react";

import "../../dapp/app/styles.css";
import { withProviders } from "./decorators";

// Polyfill Buffer for @solana/spl-token in the browser
const g = globalThis as Record<string, unknown>;
if (typeof g["Buffer"] === "undefined") {
  g["Buffer"] = Buffer;
}

// Shim vi for story files that use vi.mock (no-op in dev server)
if (typeof g["vi"] === "undefined") {
  g["vi"] = { mock: () => {}, fn: () => {}, __esModule: true };
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
      // 'todo' = show violations as warnings, 'error' = fail tests, 'off' = skip
      test: "todo",
      config: {
        rules: [{ id: "svg-img-alt", enabled: false }],
      },
    },
  },
};

export default preview;
