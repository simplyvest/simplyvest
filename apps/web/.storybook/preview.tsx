import type { Preview } from "@storybook/tanstack-react";

import "../app/styles.css";
import { withProviders } from "./decorators";

const preview: Preview = {
  decorators: [withProviders],
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
