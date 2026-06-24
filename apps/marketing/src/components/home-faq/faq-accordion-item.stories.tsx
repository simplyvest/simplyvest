import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { FaqAccordionItem } from "./faq-accordion-item";

const meta = {
  component: FaqAccordionItem,
  args: {
    question: "How does vesting work?",
    answer:
      "Vesting releases tokens gradually over time. You set a start date, end date, and optional cliff.",
    isOpen: false,
    onClick: fn(),
  },
} satisfies Meta<typeof FaqAccordionItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ args, canvas, step }) => {
    await step("question is visible", async () => {
      await expect(canvas.getByText("How does vesting work?")).toBeInTheDocument();
    });
    await step("answer is hidden when closed", async () => {
      await expect(canvas.queryByText(/Vesting releases tokens/)).not.toBeInTheDocument();
    });
    await step("click opens the accordion", async () => {
      await userEvent.click(canvas.getByText("How does vesting work?"));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};

export const Open: Story = {
  args: { isOpen: true },
  play: async ({ args, canvas, step }) => {
    await step("answer is visible when open", async () => {
      await expect(canvas.getByText(/Vesting releases tokens/)).toBeInTheDocument();
    });
    await step("click closes the accordion", async () => {
      await userEvent.click(canvas.getByText("How does vesting work?"));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};
