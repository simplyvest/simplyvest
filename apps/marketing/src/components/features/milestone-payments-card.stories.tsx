import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { MilestonePaymentsCard } from "./milestone-payments-card";

const meta = { component: MilestonePaymentsCard } satisfies Meta<typeof MilestonePaymentsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
