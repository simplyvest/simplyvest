import type { StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { ModalOverlay } from "./modal-overlay";

const content = (
  <div className="rounded-xl bg-bg1 p-6 shadow-lg">
    <h2 className="text-lg font-semibold text-text">Confirm Action</h2>
    <p className="mt-2 text-sm text-muted">Are you sure you want to proceed?</p>
    <div className="mt-4 flex justify-end gap-3">
      <button className="rounded-md bg-sol px-4 py-2 text-sm text-white">Confirm</button>
    </div>
  </div>
);

const meta = {
  component: ModalOverlay,
  args: {
    children: content,
    onClose: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders content inside the overlay", async () => {
      await expect(canvas.getByText(/Are you sure/i)).toBeInTheDocument();
    });
    await step("renders the Confirm button", async () => {
      await expect(canvas.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
    });
  },
};

export const ClickOutside: Story = {
  play: async ({ args, canvas, step }) => {
    await step("clicking the backdrop calls onClose", async () => {
      // The outer div is the backdrop — clicking it triggers onClose
      // (click event checks e.target === e.currentTarget)
      const backdrop = canvas.getByText(/Are you sure/i).closest(".fixed");
      if (backdrop) {
        await userEvent.click(backdrop);
      }
      await expect(args.onClose).toHaveBeenCalled();
    });
  },
};
