import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { DocsHero } from "./docs-hero";

const meta = { component: DocsHero } satisfies Meta<typeof DocsHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
