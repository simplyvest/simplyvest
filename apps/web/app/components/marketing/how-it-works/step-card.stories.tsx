import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { StepCard } from "./step-card";

const Icon = (props: { className?: string; strokeWidth?: number }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth ?? 1.5}
  >
    <path d="M21 12a9 9 0 1 1-9-9" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const meta = {
  component: StepCard,
  args: {
    step: {
      number: 1,
      title: "Connect Wallet",
      icon: Icon,
      label: "Step 1",
      description:
        "Connect your Solana wallet to get started. SimplyVest supports Phantom, Backpack, and all major wallets.",
      details: ["Install wallet", "Connect to app", "Approve signature"],
    },
  },
} satisfies Meta<typeof StepCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
