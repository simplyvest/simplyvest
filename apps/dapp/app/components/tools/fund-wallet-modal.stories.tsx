import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect, userEvent, screen } from "storybook/test";

import { FundWalletModal } from "./fund-wallet-modal";

const meta = {
  component: FundWalletModal,
  args: {
    open: true,
    onOpenChange: fn(),
    walletAddress: "DRpbCBMxVnDK7maPMpNpowE5J5fB4suoA1YpF8fZQmYP",
    currentBalance: 2_500_000, // 0.0025 SOL
    onFunded: fn(),
  },
} satisfies Meta<typeof FundWalletModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ step }) => {
    await step("renders heading", async () => {
      await expect(screen.getByText("Not Enough SOL")).toBeInTheDocument();
    });
    await step("shows threshold", async () => {
      const matches = screen.getAllByText("0.011 SOL", { exact: false });
      await expect(matches.length).toBeGreaterThanOrEqual(1);
    });
    await step("shows wallet address", async () => {
      await expect(
        screen.getByText("DRpbCBMxVnDK7maPMpNpowE5J5fB4suoA1YpF8fZQmYP"),
      ).toBeInTheDocument();
    });
    await step("renders funded button", async () => {
      await expect(screen.getByRole("button", { name: /i've funded/i })).toBeInTheDocument();
    });
  },
};

export const ClickFunded: Story = {
  play: async ({ args, step }) => {
    await step("clicking funded calls onFunded", async () => {
      await userEvent.click(screen.getByRole("button", { name: /i've funded/i }));
      await expect(args.onFunded).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClickCopy: Story = {
  play: async ({ step }) => {
    await step("clicking copy shows Copied", async () => {
      const copyBtn = screen.getByRole("button", { name: /copy/i });
      await userEvent.click(copyBtn);
      await expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
    });
  },
};
