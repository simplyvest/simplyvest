import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { StreamCreationSuccess } from "./stream-creation-success";

const meta = {
  title: "Dapp/Streams/Creation Success",
  component: StreamCreationSuccess,
  args: {
    txSignature: "5KtPn3Ex7rAbCdEfGhIjKlMnOpQrStUvWxYz1234567qz7P",
    streamPda: "7NX7RrJpvnXYsBgvGMjRpfLgHsJhMhYHkLqg2Qz3Vn2",
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

    await step("renders full tx signature as explorer link", async () => {
      const link = canvas.getByRole("link", { name: args.txSignature });
      await expect(link).toBeInTheDocument();
      await expect(link).toHaveAttribute(
        "href",
        expect.stringContaining("explorer.solana.com/tx/"),
      );
    });

    await step("click 'Create Another' calls onReset", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /create another/i }));
      await expect(args.onReset).toHaveBeenCalledTimes(1);
    });

    await step("click 'View Stream' navigates to detail", async () => {
      await expect(canvas.getByRole("button", { name: /view stream/i })).toBeInTheDocument();
    });
  },
};
