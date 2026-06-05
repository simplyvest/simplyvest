import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Select } from "./select";

const meta = {
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

export const Default: Story = {};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    value: "b",
  },
};
