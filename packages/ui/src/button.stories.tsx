import { Button } from "@simplyvest/ui/button";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {},
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "brand",
        "outline-brand",
        "light-brand",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    onClick: fn(),
  },
  play: async ({ args, canvas, step }) => {
    await step("click triggers onClick", async () => {
      const button = canvas.getByRole("button", { name: /button/i });
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Cancel",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const Brand: Story = {
  args: {
    children: "Try Beta App",
    variant: "brand",
  },
};

export const OutlineBrand: Story = {
  args: {
    children: "Join Waitlist",
    variant: "outline-brand",
  },
};

export const LightBrand: Story = {
  args: {
    children: "Join Waitlist",
    variant: "light-brand",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
    onClick: fn(),
  },
  play: async ({ args, canvas, step }) => {
    await step("focus and press Enter triggers onClick", async () => {
      await expect(canvas.getByRole("button", { name: /small/i })).toBeInTheDocument();
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

export const Icon: Story = {
  args: {
    children: "★",
    size: "icon",
    variant: "ghost",
    onClick: fn(),
  },
  play: async ({ args, canvas, step }) => {
    await step("click triggers onClick", async () => {
      const button = canvas.getByRole("button", { name: /★/i });
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvas, step }) => {
    await step("disabled button cannot be clicked", async () => {
      const button = canvas.getByRole("button", { name: /disabled/i });
      await expect(button).toBeDisabled();
    });
  },
};
