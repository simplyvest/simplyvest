import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { LinearVestingCard } from "../../src/components/features/linear-vesting-card";

const meta = { component: LinearVestingCard } satisfies Meta<typeof LinearVestingCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
