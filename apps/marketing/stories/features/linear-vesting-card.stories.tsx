import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { LinearVestingCard } from "../../src/components/features/linear-vesting-card";

const meta = {
  title: "Marketing/Features/Linear Card",
  component: LinearVestingCard,
} satisfies Meta<typeof LinearVestingCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
