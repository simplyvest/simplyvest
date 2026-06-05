import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Button } from "./button";

const meta = {
  component: Button,
  args: {},
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "brand",
        "outline-brand",
        "light-brand",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Cancel",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const Brand: Story = {
  args: {
    children: "Try Beta App",
    variant: "brand",
  },
};

export const OutlineBrand: Story = {
  args: {
    children: "Join Waitlist",
    variant: "outline-brand",
  },
};

export const LightBrand: Story = {
  args: {
    children: "Join Waitlist",
    variant: "light-brand",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

export const Icon: Story = {
  args: {
    children: "★",
    size: "icon",
    variant: "ghost",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
