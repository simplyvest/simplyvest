import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Features } from "../../src/components/features/features";

const meta = {
  component: Features,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Features>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
