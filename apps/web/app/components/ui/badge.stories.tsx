import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Badge } from "./badge";

const meta = {
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["sol", "sol2", "warn"],
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
