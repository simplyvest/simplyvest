import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { HowItWorks } from "../../src/components/how-it-works/how-it-works";

const meta = {
  component: HowItWorks,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HowItWorks>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
