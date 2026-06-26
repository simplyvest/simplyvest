import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { Input } from "./input";

const meta = {
  title: "UI/Input",
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

export const Default: Story = {
  args: { onChange: fn() },
  play: async ({ args, canvas, step }) => {
    const input = canvas.getByPlaceholderText("Placeholder");
    await step("Type into input", async () => {
      await userEvent.type(input, "hello");
    });
    await step("Verify onChange was called", async () => {
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const Filled: Story = {
  args: {
    value: "Some value",
    onChange: fn(),
  },
  play: async ({ args, canvas, step }) => {
    const input = canvas.getByPlaceholderText("Placeholder");
    await step("Clear and retype", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "New value");
    });
    await step("Verify onChange was called", async () => {
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    value: "bad",
    onChange: fn(),
  },
  play: async ({ args, canvas, step }) => {
    const input = canvas.getByPlaceholderText("Placeholder");
    await step("Type into invalid input", async () => {
      await userEvent.type(input, "more");
    });
    await step("Verify onChange was called", async () => {
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Can't edit",
    onChange: fn(),
  },
  play: async ({ args, canvas, step }) => {
    const input = canvas.getByPlaceholderText("Placeholder");
    await step("Attempt typing into disabled input", async () => {
      await userEvent.type(input, "hello");
    });
    await step("Verify onChange was NOT called", async () => {
      await expect(args.onChange).not.toHaveBeenCalled();
    });
  },
};

export const WithEmail: Story = {
  args: {
    type: "email",
    placeholder: "your@email.com",
    onChange: fn(),
  },
  play: async ({ args, canvas, step }) => {
    const input = canvas.getByPlaceholderText("your@email.com");
    await step("Type email address", async () => {
      await userEvent.type(input, "user@test.com");
    });
    await step("Verify onChange was called", async () => {
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const WithDateTime: Story = {
  args: {
    type: "datetime-local",
  },
};
