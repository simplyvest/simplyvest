import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { TokenRow } from "./token-row";

const meta = {
  title: "Dapp/Tokens/Row",
  component: TokenRow,
  args: {
    name: "USD Coin",
    symbol: "USDC",
    mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    balance: "1,234.56",
  },
} satisfies Meta<typeof TokenRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SVToken: Story = {
  args: {
    name: "SILLY",
    symbol: "SILLY",
    mintAddress: "7EYQ...xYkL",
    balance: "100K",
    isSVToken: true,
  },
};

export const Selected: Story = {
  args: {
    name: "Bonk",
    symbol: "BONK",
    mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    balance: "50M",
    isSelected: true,
  },
};

export const NoBalance: Story = {
  args: {
    name: "Jito Staked SOL",
    symbol: "JitoSOL",
    mintAddress: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
  },
};

export const LongName: Story = {
  args: {
    name: "Super Long Token Name That Gets Truncated",
    symbol: "LONG",
    mintAddress: "abc...xyz",
    balance: "1.00",
  },
};
