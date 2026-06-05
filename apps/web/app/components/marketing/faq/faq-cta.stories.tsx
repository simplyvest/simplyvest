import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FaqCta } from "./faq-cta";

const meta = { component: FaqCta } satisfies Meta<typeof FaqCta>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
