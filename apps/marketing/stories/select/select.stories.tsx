import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { Select } from "../../src/components/select";

const meta = {
  title: "Marketing/Select",
  component: Select,
  args: {
    children: (
      <>
        <option value="">Select an option</option>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
        <option value="c">Option C</option>
      </>
    ),
  },
  argTypes: {
    invalid: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ args, canvas, step }) => {
    const select = canvas.getByRole("combobox");
    await step("select an option", async () => {
      await userEvent.selectOptions(select, "a");
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onChange: fn(),
  },
  play: async ({ args, canvas, step }) => {
    const select = canvas.getByRole("combobox");
    await step("disabled select does not trigger onChange", async () => {
      await expect(select).toBeDisabled();
      await userEvent.selectOptions(select, "a");
      await expect(args.onChange).not.toHaveBeenCalled();
    });
  },
};

export const WithValue: Story = {
  args: {
    value: "b",
    onChange: fn(),
  },
  play: async ({ args, canvas, step }) => {
    const select = canvas.getByRole("combobox");
    await step("change selection and verify onChange", async () => {
      await expect(select).toHaveValue("b");
      await userEvent.selectOptions(select, "a");
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};
