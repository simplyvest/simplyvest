import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { HowItWorks } from "../../src/components/how-it-works/how-it-works";

const meta = { component: HowItWorks } satisfies Meta<typeof HowItWorks>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
