import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { WaitlistHero } from "./waitlist-hero";

const meta = { component: WaitlistHero } satisfies Meta<typeof WaitlistHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
