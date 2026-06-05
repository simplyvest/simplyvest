import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Features } from "./features";

const meta = { component: Features } satisfies Meta<typeof Features>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
