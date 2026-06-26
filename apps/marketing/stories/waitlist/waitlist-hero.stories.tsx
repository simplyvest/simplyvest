import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { WaitlistHero } from "../../src/components/waitlist/waitlist-hero";

const meta = {
  title: "Marketing/Waitlist",
  component: WaitlistHero,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WaitlistHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
