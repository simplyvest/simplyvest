import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CancelAnytimeCard } from "../../src/components/features/cancel-anytime-card";

const meta = {
  title: "Marketing/Features/Cancel Card",
  component: CancelAnytimeCard,
} satisfies Meta<typeof CancelAnytimeCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
