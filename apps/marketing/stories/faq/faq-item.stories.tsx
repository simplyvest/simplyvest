import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FaqItem } from "../../src/components/faq/faq-item";

const meta = {
  title: "Marketing/FAQ/Item",
  component: FaqItem,
  args: {
    question: "What is SimplyVest?",
    answer:
      "SimplyVest is a token vesting and distribution platform built on Solana. It enables projects to create custom vesting schedules, manage token grants, and automate distributions with non-custodial security.",
    index: 0,
  },
} satisfies Meta<typeof FaqItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
