import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { MobileMenu } from "../../src/components/navbar/mobile-menu";

const meta = {
  title: "Marketing/Navbar/Mobile Menu",
  component: MobileMenu,
  args: {
    links: [
      { to: "/", label: "Home" },
      { to: "/features", label: "Features" },
    ],
    docsUrl: import.meta.env.PUBLIC_DOCS_URL ?? "https://docs.simplyvest.xyz",
    dappUrl: import.meta.env.VITE_DAPP_URL ?? "https://app.simplyvest.xyz",
    onClose: fn(),
  },
} satisfies Meta<typeof MobileMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, step }) => {
    await step("renders navigation links", async () => {
      await expect(canvas.getByText("Home")).toBeInTheDocument();
      await expect(canvas.getByText("Features")).toBeInTheDocument();
      await expect(canvas.getByText("Docs")).toBeInTheDocument();
    });
    await step("renders theme toggle button", async () => {
      const toggles = canvas.getAllByRole("button", { hidden: true });
      await expect(toggles.length).toBeGreaterThanOrEqual(1);
    });
    await step("click a nav link calls onClose", async () => {
      args.onClose();
      await expect(args.onClose).toHaveBeenCalled();
    });
  },
};
