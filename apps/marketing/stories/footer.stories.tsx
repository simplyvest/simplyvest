import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Footer } from "../src/components/footer";

const meta = {
  title: "Marketing/Footer",
  component: Footer,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Footer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
