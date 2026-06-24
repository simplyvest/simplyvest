import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FloatingCards } from "./floating-cards";

const meta = { component: FloatingCards } satisfies Meta<typeof FloatingCards>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
