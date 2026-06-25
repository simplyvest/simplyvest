import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FaqHero } from "../../src/components/faq/faq-hero";

const meta = {
  title: "Marketing/FAQ/Hero",
  component: FaqHero,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FaqHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
