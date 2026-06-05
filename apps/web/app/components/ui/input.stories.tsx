import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Input } from "./input";

const meta = {
  component: Input,
  args: { type: "text", placeholder: "Placeholder" },
  argTypes: {
    invalid: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    type: {
      control: "select",
      options: ["text", "email", "number", "password", "datetime-local"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    value: "Some value",
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    value: "bad",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Can't edit",
  },
};

export const WithEmail: Story = {
  args: {
    type: "email",
    placeholder: "your@email.com",
  },
};

export const WithDateTime: Story = {
  args: {
    type: "datetime-local",
  },
};
