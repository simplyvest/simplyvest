import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Badge } from "./badge";

const meta = {
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "success", "info", "warn", "sol", "sol2"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Active",
    variant: "sol",
  },
};

export const Completed: Story = {
  args: {
    children: "Completed",
    variant: "sol2",
  },
};

export const Cancelled: Story = {
  args: {
    children: "Cancelled",
    variant: "warn",
  },
};
