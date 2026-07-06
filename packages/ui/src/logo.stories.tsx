import { Logo } from "@simplyvest/ui/logo/logo";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

const meta = {
  title: "UI/Logo",
  component: Logo,
  args: {
    size: 48,
    title: "SimplyVest",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["tile", "mark"],
    },
    background: {
      control: "select",
      options: ["brand", "primary", "transparent"],
    },
    size: {
      control: { type: "number", min: 16, max: 128, step: 4 },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultTile: Story = {
  args: {
    variant: "tile",
    size: 48,
    background: "brand",
  },
};

export const PrimaryBackground: Story = {
  args: {
    variant: "tile",
    size: 48,
    background: "primary",
  },
};

export const MarkOnly: Story = {
  args: {
    variant: "mark",
    size: 48,
    className: "text-primary",
  },
};

export const NavbarSize: Story = {
  args: {
    variant: "tile",
    size: 20,
    background: "brand",
  },
};

export const LoginSize: Story = {
  args: {
    variant: "tile",
    size: 48,
    background: "brand",
  },
};
