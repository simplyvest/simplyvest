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
  component: FeatureCard,
  args: {
    feature: {
      icon: Icon,
      label: "SECURITY",
      title: "Audited",
      description:
        "Professionally audited by leading firms. All smart contracts are open source and verified.",
    },
    highlighted: true,
  },
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
