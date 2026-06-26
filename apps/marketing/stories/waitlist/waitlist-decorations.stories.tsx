import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { WaitlistDecorations } from "../../src/components/waitlist/waitlist-decorations";

const meta = {
  title: "Marketing/Waitlist/Decorations",
  component: WaitlistDecorations,
} satisfies Meta<typeof WaitlistDecorations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
