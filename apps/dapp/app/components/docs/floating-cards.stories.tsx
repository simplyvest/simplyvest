import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FloatingCards } from "./floating-cards";

const meta = {
  title: "Dapp/Docs/Floating Cards",
  component: FloatingCards,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FloatingCards>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
