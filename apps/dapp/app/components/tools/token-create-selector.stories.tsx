import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";

import { TokenCreateSelector } from "./token-create-selector";

const meta = {
  title: "Dapp/Tools/Create Selector",
  component: TokenCreateSelector,
} satisfies Meta<typeof TokenCreateSelector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders both options", async () => {
      await expect(canvas.getByText("Create on Platform")).toBeInTheDocument();
      await expect(canvas.getByText("Create with Wallet")).toBeInTheDocument();
    });
  },
};
