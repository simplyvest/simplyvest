import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FaqItem } from "../../src/components/faq/faq-item";

const meta = {
  title: "Marketing/FAQ/Item",
  component: FaqItem,
  args: {
    question: "What is SimplyVest?",
    answer:
      "SimplyVest is a tokenized equity vesting platform for modern teams. Create your organization, issue or link an SPL token as your equity token, and vest it to team members with web2 login and on-chain custody.",
    index: 0,
  },
} satisfies Meta<typeof FaqItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
