import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FeatureCard } from "../../src/components/security/security-feature-card";

const Icon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const meta = {
  title: "Marketing/Security/Card",
  component: FeatureCard,
  args: {
    feature: {
      icon: Icon,
      label: "PDA",
      title: "Vaults",
      description:
        "All tokens secured in program-derived addresses with mathematical guarantees. No admin keys or backdoors.",
    },
  },
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProtocolFees: Story = {
  args: {
    feature: {
      icon: Icon,
      label: "0",
      title: "Protocol Fees",
      description:
        "Zero protocol fees forever. Pay only network transaction costs. No hidden charges or revenue extraction.",
    },
  },
};
