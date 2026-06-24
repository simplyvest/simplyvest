import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { SecurityDecorations } from "../../src/components/security/security-decorations";

const meta = { component: SecurityDecorations } satisfies Meta<typeof SecurityDecorations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
