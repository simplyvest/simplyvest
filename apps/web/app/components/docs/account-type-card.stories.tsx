import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { AccountTypeCard } from "./account-type-card";

const Icon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const meta = {
  component: AccountTypeCard,
  args: {
    color: "green",
    icon: Icon,
    label: "Sender",
    monoLabel: "Creator",
    description: "Creates streams and manages token distribution schedules for recipients.",
  },
} satisfies Meta<typeof AccountTypeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
