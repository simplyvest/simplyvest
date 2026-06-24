import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { UseCaseCard } from "../../src/components/use-cases/use-case-card";

const Icon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const meta = {
  component: UseCaseCard,
  args: {
    item: {
      icon: Icon,
      number: "01",
      title: "Token Grants",
      description:
        "Issue tokens to contributors with custom vesting schedules and cliff conditions.",
      features: ["Custom schedule", "Cliff", "Revocable"],
      highlighted: true,
    },
  },
} satisfies Meta<typeof UseCaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
