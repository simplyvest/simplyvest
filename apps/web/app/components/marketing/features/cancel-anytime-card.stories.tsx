import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CancelAnytimeCard } from "./cancel-anytime-card";

const meta = { component: CancelAnytimeCard } satisfies Meta<typeof CancelAnytimeCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
