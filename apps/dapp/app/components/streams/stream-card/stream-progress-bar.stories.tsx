import type { Meta, StoryObj } from "@storybook/tanstack-react";
import BN from "bn.js";

import { StreamProgressBar } from "./stream-progress-bar";

const bn = (n: number) => new BN(n);

const meta = {
  component: StreamProgressBar,
} satisfies Meta<typeof StreamProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { progress: 0, startTime: bn(1700000000), endTime: bn(1800000000) },
};

export const Halfway: Story = {
  args: { progress: 50, startTime: bn(1700000000), endTime: bn(1800000000) },
};

export const Complete: Story = {
  args: { progress: 100, startTime: bn(1700000000), endTime: bn(1800000000) },
};
