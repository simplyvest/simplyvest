import type { StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";
import { vi } from "vitest";

import { WaitlistForm } from "./waitlist-form";

// Mock analytics (optional internal dependency)
vi.mock("@/hooks/use-analytics", () => ({
  useAnalytics: () => ({ track: fn() }),
}));

const meta = {
  component: WaitlistForm,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders form fields", async () => {
      await expect(canvas.getByPlaceholderText(/example/i)).toBeInTheDocument();
    });
    await step("renders submit button", async () => {
      await expect(canvas.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
    });
  },
};

export const TypeAndSubmit: Story = {
  play: async ({ canvas, step }) => {
    await step("type name", async () => {
      const name = canvas.getByPlaceholderText(/full name/i);
      await userEvent.type(name, "Alice");
      await expect(name).toHaveValue("Alice");
    });
    await step("type email", async () => {
      const email = canvas.getByPlaceholderText(/example/i);
      await userEvent.type(email, "alice@example.com");
      await expect(email).toHaveValue("alice@example.com");
    });
    await step("submit button enabled", async () => {
      const btn = canvas.getByRole("button", { name: /join waitlist/i });
      await expect(btn).not.toBeDisabled();
    });
  },
};
