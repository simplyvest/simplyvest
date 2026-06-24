import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { userEvent, expect } from "storybook/test";

import { withProviders } from "@/.storybook/decorators";

import { HomeFAQ } from "./home-faq";

const meta = {
  component: HomeFAQ,
  decorators: [withProviders],
} satisfies Meta<typeof HomeFAQ>;
export default meta;
type Story = StoryObj<typeof meta>;

const faqHeadings = [
  "What is SimplyVest?",
  "What's the difference between time-based and milestone vesting?",
  "Is SimplyVest custodial?",
  "Can I cancel a stream?",
  "What happens when a stream completes?",
  "Does SimplyVest charge fees?",
  "How do I get started?",
];

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders the section heading", async () => {
      await expect(canvas.getByText("Frequently Asked Questions")).toBeInTheDocument();
    });

    await step("all 7 FAQ items are rendered", async () => {
      await Promise.all(faqHeadings.map((q) => expect(canvas.getByText(q)).toBeInTheDocument()));
    });

    await step("answers are hidden by default", async () => {
      const answers = canvas.queryAllByText(/non-custodial token vesting protocol/);
      await expect(answers.length).toBe(0);
    });

    await step("clicking a question reveals its answer", async () => {
      await userEvent.click(canvas.getByText(faqHeadings[0]));
      await expect(canvas.getByText(/SimplyVest is a non-custodial/)).toBeInTheDocument();
    });

    await step("clicking another question closes the first", async () => {
      await userEvent.click(canvas.getByText(faqHeadings[3]));
      await expect(canvas.queryByText(/SimplyVest is a non-custodial/)).not.toBeInTheDocument();
      await expect(canvas.getByText(/Yes, stream creators can cancel/)).toBeInTheDocument();
    });

    await step("clicking the open question closes it", async () => {
      await userEvent.click(canvas.getByText(faqHeadings[3]));
      await expect(canvas.queryByText(/Yes, stream creators can cancel/)).not.toBeInTheDocument();
    });

    await step("renders link to full FAQ page", async () => {
      const link = canvas.getByText("View full FAQ");
      await expect(link).toBeInTheDocument();
    });
  },
};
