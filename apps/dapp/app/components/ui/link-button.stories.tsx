import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { LinkButton } from "./link-button";

const meta = {
  title: "UI/Link Button",
  component: LinkButton,
  args: { to: "." },
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
} satisfies Meta<typeof LinkButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  args: {
    children: "Documentation",
    variant: "brand",
  },
};

export const OutlineBrand: Story = {
  args: {
    children: "Join Waitlist",
    variant: "outline-brand",
  },
};

export const Outline: Story = {
  args: {
    children: "Read Docs",
    variant: "outline",
  },
};

export const LightBrand: Story = {
  args: {
    children: "Get Started",
    variant: "light-brand",
  },
};

export const Link: Story = {
  args: {
    children: "View full FAQ",
    variant: "link",
    to: "/faq",
  },
};
