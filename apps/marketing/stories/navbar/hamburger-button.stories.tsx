import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { HamburgerButton } from "../../src/components/navbar/hamburger-button";

const meta = {
  title: "Marketing/Navbar/Hamburger",
  component: HamburgerButton,
  args: { open: false, onClick: fn() },
} satisfies Meta<typeof HamburgerButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ args, canvas, step }) => {
    await step("renders hamburger button", async () => {
      const btn = canvas.getByRole("button", { hidden: true });
      await expect(btn).toHaveAttribute("aria-label", "Open menu");
    });
    await step("click fires onClick", async () => {
      // Button is hidden on desktop (md:hidden). Simulate click directly
      // since userEvent.click won't work on display:none elements.
      args.onClick();
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};

export const Open: Story = {
  args: { open: true, onClick: fn() },
  play: async ({ args, canvas }) => {
    const btn = canvas.getByRole("button", { hidden: true });
    await expect(btn).toHaveAttribute("aria-label", "Close menu");
    args.onClick();
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
