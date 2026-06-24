import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { NavLinks } from "./nav-links";

const meta = {
  component: NavLinks,
  args: {
    links: [
      { to: "/", label: "Home" },
      { to: "/docs", label: "Docs" },
      { to: "/faq", label: "FAQ" },
    ],
  },
} satisfies Meta<typeof NavLinks>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onClick: fn() },
  play: async ({ canvas, step }) => {
    await step("renders all nav links", async () => {
      await expect(canvas.getByText("Home")).toBeInTheDocument();
      await expect(canvas.getByText("Docs")).toBeInTheDocument();
      await expect(canvas.getByText("FAQ")).toBeInTheDocument();
    });
  },
};
