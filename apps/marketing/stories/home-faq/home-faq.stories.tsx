import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { userEvent, expect } from "storybook/test";

import { HomeFAQ } from "../../src/components/home-faq/home-faq";

const meta = {
  title: "Marketing/FAQ/Accordion Section",
  component: HomeFAQ,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HomeFAQ>;
export default meta;
type Story = StoryObj<typeof meta>;

const faqHeadings = [
  "What is SimplyVest?",
  "Do my team members need a crypto wallet?",
  "How is this different from Carta or Streamflow?",
  "Is SimplyVest custodial?",
  "What vesting schedules are supported?",
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
      const answers = canvas.queryAllByText(/tokenized equity vesting platform/);
      await expect(answers.length).toBe(0);
    });

    await step("clicking a question reveals its answer", async () => {
      await userEvent.click(canvas.getByText(faqHeadings[0]));
      await expect(canvas.getByText(/tokenized equity vesting platform/)).toBeInTheDocument();
    });

    await step("clicking another question closes the first", async () => {
      await userEvent.click(canvas.getByText(faqHeadings[3]));
      await expect(canvas.queryByText(/tokenized equity vesting platform/)).not.toBeInTheDocument();
      await expect(canvas.getByText(/program-derived vaults on Solana/)).toBeInTheDocument();
    });

    await step("clicking the open question closes it", async () => {
      await userEvent.click(canvas.getByText(faqHeadings[3]));
      await expect(canvas.queryByText(/program-derived vaults on Solana/)).not.toBeInTheDocument();
    });

    await step("renders link to full FAQ page", async () => {
      const link = canvas.getByText("View full FAQ");
      await expect(link).toBeInTheDocument();
    });
  },
};
