import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { PdaVaultsCard } from "./pda-vaults-card";

const meta = { component: PdaVaultsCard } satisfies Meta<typeof PdaVaultsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
