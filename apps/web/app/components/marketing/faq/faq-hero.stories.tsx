import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FaqHero } from "./faq-hero";

const meta = { component: FaqHero } satisfies Meta<typeof FaqHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
