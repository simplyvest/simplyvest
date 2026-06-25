import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { DocsHero } from "./docs-hero";

const meta = {
  title: "Dapp/Docs/Hero",
  component: DocsHero,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DocsHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
