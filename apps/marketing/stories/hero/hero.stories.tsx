import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Hero } from "../../src/components/hero/hero";

const meta = {
  title: "Marketing/Hero",
  component: Hero,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Hero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
