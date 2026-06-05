import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { TimeFields } from "./time-fields";

const meta = {
  component: TimeFields,
  args: {
    startTime: "",
    endTime: "",
    cliffTime: "",
    onStartTimeChange: fn(),
    onEndTimeChange: fn(),
    onCliffTimeChange: fn(),
  },
} satisfies Meta<typeof TimeFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, step }) => {
    await step("fill in start date", async () => {
      const startInput = canvas.getByLabelText(/start date/i);
      await userEvent.clear(startInput);
      await userEvent.type(startInput, "2026-06-10T10:00");
      await expect(args.onStartTimeChange).toHaveBeenCalled();
    });

    await step("fill in end date", async () => {
      const endInput = canvas.getByLabelText(/end date/i);
      await userEvent.clear(endInput);
      await userEvent.type(endInput, "2026-12-10T10:00");
      await expect(args.onEndTimeChange).toHaveBeenCalled();
    });

    await step("fill in cliff date", async () => {
      const cliffInput = canvas.getByLabelText(/cliff date/i);
      await userEvent.clear(cliffInput);
      await userEvent.type(cliffInput, "2026-09-10T10:00");
      await expect(args.onCliffTimeChange).toHaveBeenCalled();
    });
  },
};

export const Prefilled: Story = {
  args: {
    startTime: "2026-06-10T10:00",
    endTime: "2026-12-10T10:00",
    cliffTime: "2026-09-10T10:00",
  },
  play: async ({ canvas, step }) => {
    await step("start date is pre-filled", async () => {
      const startInput = canvas.getByLabelText(/start date/i);
      await expect(startInput).toHaveValue("2026-06-10T10:00");
    });

    await step("end date is pre-filled", async () => {
      const endInput = canvas.getByLabelText(/end date/i);
      await expect(endInput).toHaveValue("2026-12-10T10:00");
    });

    await step("cliff date is pre-filled", async () => {
      const cliffInput = canvas.getByLabelText(/cliff date/i);
      await expect(cliffInput).toHaveValue("2026-09-10T10:00");
    });
  },
};
