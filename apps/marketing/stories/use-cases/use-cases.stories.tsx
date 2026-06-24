import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { UseCases } from "../../src/components/use-cases/use-cases";

const meta = {
  component: UseCases,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof UseCases>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
