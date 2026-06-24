import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { HeroStatsCards } from "./hero-stats-cards";

const meta = { component: HeroStatsCards } satisfies Meta<typeof HeroStatsCards>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
