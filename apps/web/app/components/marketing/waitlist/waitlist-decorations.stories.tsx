import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { WaitlistDecorations } from "./waitlist-decorations";

const meta = { component: WaitlistDecorations } satisfies Meta<typeof WaitlistDecorations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
