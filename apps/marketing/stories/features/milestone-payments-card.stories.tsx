import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { MilestonePaymentsCard } from "../../src/components/features/milestone-payments-card";

const meta = {
  title: "Marketing/Features/Milestone Card",
  component: MilestonePaymentsCard,
} satisfies Meta<typeof MilestonePaymentsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
