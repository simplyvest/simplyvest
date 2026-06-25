import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { SecurityFeatureRow } from "./security-feature-row";

const Icon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const meta = {
  title: "Dapp/Docs/Security Row",
  component: SecurityFeatureRow,
  args: {
    color: "blue",
    icon: Icon,
    title: "Non-custodial",
    description:
      "You control your tokens at all times. Streams are executed by the program, not by an intermediary.",
  },
} satisfies Meta<typeof SecurityFeatureRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
