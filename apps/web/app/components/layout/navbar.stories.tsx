import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { withWalletProvider } from "@/../.storybook/decorators";

import { Navbar } from "./navbar";

const meta = {
  component: Navbar,
  decorators: [withWalletProvider],
} satisfies Meta<typeof Navbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
