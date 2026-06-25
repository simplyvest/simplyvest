import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { DecorativeDots } from "../../src/components/use-cases/use-case-decorations";

const meta = {
  title: "Marketing/Use Cases/Decorations",
  component: DecorativeDots,
} satisfies Meta<typeof DecorativeDots>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
