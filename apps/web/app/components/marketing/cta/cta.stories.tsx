import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CTA } from "./cta";

const meta = { component: CTA } satisfies Meta<typeof CTA>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
