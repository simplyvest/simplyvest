import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { LuUserPlus } from "react-icons/lu";

import { StepCard } from "../../src/components/how-it-works/step-card";

const meta = {
  title: "Marketing/How It Works/Card",
  component: StepCard,
  args: {
    step: {
      number: 1,
      title: "Sign Up",
      icon: LuUserPlus,
      label: "email · google",
      description:
        "Log in with email or Google. An embedded Solana wallet is created automatically — no extension, no seed phrase.",
      details: ["Email or Google via Privy", "Embedded wallet created", "Approve signature"],
    },
  },
} satisfies Meta<typeof StepCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
