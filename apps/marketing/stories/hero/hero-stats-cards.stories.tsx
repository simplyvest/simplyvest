import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { HeroStatsCards } from "../../src/components/hero/hero-stats-cards";

const meta = {
  title: "Marketing/Hero/Cards",
  component: HeroStatsCards,
} satisfies Meta<typeof HeroStatsCards>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
