import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { LuMail } from "react-icons/lu";

import { FeatureCard } from "../../src/components/features/feature-card";

const meta = {
  title: "Marketing/Features/Card",
  component: FeatureCard,
  args: {
    icon: LuMail,
    title: "No wallet required",
    description:
      "Sign in with email or Google. Embedded wallets are created automatically so your whole team can participate.",
  },
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
