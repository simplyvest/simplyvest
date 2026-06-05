import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { StreamCreationSuccess } from "./stream-creation-success";

const meta = {
  component: StreamCreationSuccess,
  args: {
    txSignature: "5KtPn3Ex7rAbCdEfGhIjKlMnOpQrStUvWxYz1234567qz7P",
    onReset: fn(),
  },
} satisfies Meta<typeof StreamCreationSuccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, step }) => {
    await step("renders success heading", async () => {
      await expect(canvas.getByText("Stream Created!")).toBeInTheDocument();
    });

    await step("renders truncated tx signature", async () => {
      // Component slices to 16 chars then appends "..."
      const truncated = args.txSignature.slice(0, 16);
      await expect(canvas.getByText(new RegExp(`${truncated}\\.{3}`))).toBeInTheDocument();
    });

    await step("click 'Create Another' calls onReset", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /create another/i }));
      await expect(args.onReset).toHaveBeenCalledTimes(1);
    });
  },
};
