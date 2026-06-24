import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Security } from "./security";

const meta = { component: Security } satisfies Meta<typeof Security>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
