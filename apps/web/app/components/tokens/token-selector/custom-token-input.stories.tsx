import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { CustomTokenInput } from "./custom-token-input";

const MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const meta = {
  component: CustomTokenInput,
  args: {
    value: "",
    onChange: fn(),
    onSwitchToOwned: fn(),
  },
} satisfies Meta<typeof CustomTokenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, step }) => {
    await step("renders input and Owned button", async () => {
      const input = canvas.getByRole("textbox");
      await expect(input).toBeInTheDocument();
      await expect(input).toHaveAttribute("placeholder", "Enter SPL token mint address");
      const ownedBtn = canvas.getByRole("button", { name: "Owned" });
      await expect(ownedBtn).toBeInTheDocument();
    });

    await step("typing fires onChange for each keystroke", async () => {
      const input = canvas.getByRole("textbox");
      await userEvent.type(input, MINT_ADDRESS);
      // onChange fires once per character with the current input value
      await expect(args.onChange).toHaveBeenCalledTimes(MINT_ADDRESS.length);
    });

    await step("clicking Owned button fires onSwitchToOwned", async () => {
      const ownedBtn = canvas.getByRole("button", { name: "Owned" });
      await userEvent.click(ownedBtn);
      await expect(args.onSwitchToOwned).toHaveBeenCalled();
    });
  },
};
