import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect, userEvent, screen } from "storybook/test";

import { ModeChoiceModal } from "./mode-choice-modal";

const meta = {
  component: ModeChoiceModal,
  args: {
    open: true,
    onOpenChange: fn(),
    onSelectMode: fn(),
  },
} satisfies Meta<typeof ModeChoiceModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ step }) => {
    await step("renders title", async () => {
      await expect(screen.getByText(/how would you like/i)).toBeInTheDocument();
    });
    await step("renders platform card", async () => {
      await expect(screen.getByText("Create for Me")).toBeInTheDocument();
      await expect(screen.getByText("Create Token on Platform")).toBeInTheDocument();
    });
    await step("renders wallet card", async () => {
      await expect(screen.getByText("Create with Wallet")).toBeInTheDocument();
      await expect(screen.getByText("Create Token with Wallet")).toBeInTheDocument();
    });
  },
};

export const SelectPlatform: Story = {
  play: async ({ args, step }) => {
    await step("clicking platform card selects platform mode", async () => {
      await userEvent.click(screen.getByText("Create Token on Platform"));
      await expect(args.onSelectMode).toHaveBeenCalledWith("platform");
    });
  },
};

export const SelectWallet: Story = {
  play: async ({ args, step }) => {
    await step("clicking wallet card selects wallet mode", async () => {
      await userEvent.click(screen.getByText("Create Token with Wallet"));
      await expect(args.onSelectMode).toHaveBeenCalledWith("wallet");
    });
  },
};
