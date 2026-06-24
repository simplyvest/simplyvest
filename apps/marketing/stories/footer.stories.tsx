import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Footer } from "../src/components/footer";

const meta = { component: Footer } satisfies Meta<typeof Footer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
