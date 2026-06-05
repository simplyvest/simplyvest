import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { withWalletProvider } from "@/../.storybook/decorators";

import { WalletButton } from "./wallet-button";

const meta = {
  component: WalletButton,
  decorators: [withWalletProvider],
} satisfies Meta<typeof WalletButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
