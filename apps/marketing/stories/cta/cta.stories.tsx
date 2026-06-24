import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CTA } from "../../src/components/cta/cta";

const meta = {
  component: CTA,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CTA>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
