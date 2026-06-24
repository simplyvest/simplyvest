import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { TokenCreatorForm } from "./token-creator-form";

const meta = {
  component: TokenCreatorForm,
  args: {
    onSubmit: fn(),
    isPending: false,
    mode: "platform",
  },
} satisfies Meta<typeof TokenCreatorForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Platform: Story = {
  play: async ({ canvas, step }) => {
    await step("shows platform submit button", async () => {
      await expect(
        canvas.getByRole("button", { name: /create token on platform/i }),
      ).toBeInTheDocument();
    });
  },
};

export const Wallet: Story = {
  args: {
    mode: "wallet",
  },
  play: async ({ canvas, step }) => {
    await step("shows wallet submit button", async () => {
      await expect(
        canvas.getByRole("button", { name: /create token with wallet/i }),
      ).toBeInTheDocument();
    });
  },
};

export const Pending: Story = {
  args: {
    isPending: true,
  },
  play: async ({ canvas, step }) => {
    await step("shows creating state on button", async () => {
      await expect(canvas.getByRole("button", { name: /creating token/i })).toBeInTheDocument();
    });
  },
};
