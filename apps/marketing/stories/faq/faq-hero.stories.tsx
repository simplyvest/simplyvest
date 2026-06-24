import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FaqHero } from "../../src/components/faq/faq-hero";

const meta = { component: FaqHero } satisfies Meta<typeof FaqHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
