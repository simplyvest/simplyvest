import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { Field } from "./field";
import { Input } from "./input";

const meta = {
  title: "UI/Field",
  component: Field,
  args: { children: <Input placeholder="Type here" onChange={fn()} /> },
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    error: { control: "text" },
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Your Name",
  },
  play: async ({ canvas, step }) => {
    await step("Type into the input field", async () => {
      const input = canvas.getByPlaceholderText("Type here");
      await userEvent.type(input, "hello");
      await expect(input).toHaveValue("hello");
    });
  },
};

export const Required: Story = {
  args: {
    label: "Email",
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    required: true,
    error: "Invalid email address",
  },
  play: async ({ canvas, step }) => {
    await step("Verify error message is visible", async () => {
      const alert = canvas.getByRole("alert");
      await expect(alert).toHaveTextContent("Invalid email address");
    });
  },
};

export const WithSelect: Story = {
  args: {
    label: "Country",
    children: (
      <select className="flex h-9 w-full rounded-md border border-border2 bg-bg1 px-3 py-1 text-sm text-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-warn aria-[invalid=true]:ring-warn">
        <option>United States</option>
        <option>Canada</option>
        <option>Mexico</option>
      </select>
    ),
  },
};
