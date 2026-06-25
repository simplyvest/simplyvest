import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { StreamTypeCard } from "./stream-type-card";

const Icon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const meta = {
  title: "Dapp/Docs/Stream Card",
  component: StreamTypeCard,
  args: {
    color: "purple",
    icon: Icon,
    label: "Time-based",
    title: "Linear Vesting",
    description:
      "Tokens released gradually over a set period, following a continuous linear schedule from start to cliff.",
    points: ["Set schedule", "Automatic", "Pro-rata"],
  },
} satisfies Meta<typeof StreamTypeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
