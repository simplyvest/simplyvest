import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FaqCta } from "../../src/components/faq/faq-cta";

const meta = {
  component: FaqCta,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FaqCta>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
