import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CreateTypeSelector } from "@/components/streams/create-stream/create-type-selector";

/**
 * The create stream landing page — shows three stream type cards
 * (Linear, Cliff, Milestone) that users pick from.
 */
const meta = {
  title: "Dapp/Dashboard",
  component: CreateTypeSelector,
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-bg p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateTypeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateTypeCards: Story = {};
