import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { NavLinks } from "../../src/components/navbar/nav-links";

const meta = {
  title: "Marketing/Navbar/Links",
  component: NavLinks,
  args: {
    links: [
      { to: "/", label: "Home" },
      { to: "/docs", label: "Docs" },
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
