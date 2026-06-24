import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { DecorativeDots } from "./use-case-decorations";

const meta = { component: DecorativeDots } satisfies Meta<typeof DecorativeDots>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
