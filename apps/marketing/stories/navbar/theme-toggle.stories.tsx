import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { userEvent, expect } from "storybook/test";

import { ThemeToggle } from "../../src/components/navbar/theme-toggle";

const meta = {
  title: "Marketing/Navbar/Theme Toggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders theme toggle button", async () => {
      const btn = canvas.getByRole("button", { name: /switch to/i });
      await expect(btn).toBeInTheDocument();
    });
    await step("click cycles theme", async () => {
      const btn = canvas.getByRole("button");
      const initialLabel = btn.getAttribute("aria-label");
      await userEvent.click(btn);
      const newLabel = btn.getAttribute("aria-label");
      await expect(newLabel).not.toBe(initialLabel);
    });
  },
};
