import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { StreamTypeToggle } from "./stream-type-toggle";

const meta = {
  component: StreamTypeToggle,
  args: { streamType: "time", onChange: fn() },
} satisfies Meta<typeof StreamTypeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TimeSelected: Story = {
  play: async ({ args, canvas, step }) => {
    await step("time-based is selected by default", async () => {
      const timeBtn = canvas.getByRole("button", { name: /time-based vesting/i });
      await expect(timeBtn).toHaveClass("bg-sol");
    });

    await step("click milestone button fires onChange with 'milestone'", async () => {
      const milestoneBtn = canvas.getByRole("button", { name: /milestone-gated/i });
      await userEvent.click(milestoneBtn);
      await expect(args.onChange).toHaveBeenCalledWith("milestone");
    });
  },
};

export const MilestoneSelected: Story = {
  args: { streamType: "milestone", onChange: fn() },
  play: async ({ args, canvas }) => {
    const milestoneBtn = canvas.getByRole("button", { name: /milestone-gated/i });
    await expect(milestoneBtn).toHaveClass("bg-sol");

    const timeBtn = canvas.getByRole("button", { name: /time-based vesting/i });
    await userEvent.click(timeBtn);
    await expect(args.onChange).toHaveBeenCalledWith("time");
  },
};
