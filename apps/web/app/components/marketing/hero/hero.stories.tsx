import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Hero } from "./hero";

const meta = { component: Hero } satisfies Meta<typeof Hero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
