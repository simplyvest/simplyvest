import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Security } from "../../src/components/security/security";

const meta = {
  component: Security,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Security>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
