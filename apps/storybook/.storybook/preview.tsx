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
  },
};

export default preview;
