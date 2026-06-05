import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import { TokenSelector } from "./token-selector";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_MINT = "So11111111111111111111111111111111111111112";

vi.mock("./use-owned-tokens", () => ({
  useOwnedTokens: () => ({
    tokens: [
      {
        mint: { toBase58: () => USDC_MINT },
        balance: 100_000_000n,
        address: { toBase58: () => "11111111111111111111111111111111" },
        meta: { name: "USD Coin", symbol: "USDC" },
      },
      {
        mint: { toBase58: () => SOL_MINT },
        balance: 5_050_000_000n,
        address: { toBase58: () => "SysvarRent111111111111111111111111111111111" },
        meta: { name: "Wrapped SOL", symbol: "SOL" },
      },
    ],
    loading: false,
  }),
  mintToAddress: (mint: { toBase58(): string } | null) => mint?.toBase58() ?? "",
}));

vi.mock("@solana-tdp/sdk", () => ({
  formatTokenLabel: (
    meta: { name: string; symbol: string } | null,
    mint: { toBase58(): string },
  ) => {
    if (meta?.symbol) return `${meta.name} (${meta.symbol})`;
    const addr = mint.toBase58();
    return addr.slice(0, 4) + "..." + addr.slice(-4);
  },
}));

const meta = {
  component: TokenSelector,
  args: {
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof TokenSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders owned token select with options", async () => {
      const select = canvas.getByRole("combobox");
      await expect(select).toBeInTheDocument();
      await expect(select).not.toBeDisabled();
      const options = canvas.getAllByRole("option");
      await expect(options.length).toBe(2);
    });

    await step("clicking Custom switches to custom input mode", async () => {
      const customBtn = canvas.getByRole("button", { name: "Custom" });
      await userEvent.click(customBtn);

      const input = canvas.getByRole("textbox");
      await expect(input).toBeInTheDocument();
      await expect(input).toHaveAttribute("placeholder", "Enter SPL token mint address");

      const ownedBtn = canvas.getByRole("button", { name: "Owned" });
      await expect(ownedBtn).toBeInTheDocument();
    });

    await step("clicking Owned switches back to select mode", async () => {
      const ownedBtn = canvas.getByRole("button", { name: "Owned" });
      await userEvent.click(ownedBtn);

      const select = canvas.getByRole("combobox");
      await expect(select).toBeInTheDocument();
      const options = canvas.getAllByRole("option");
      await expect(options.length).toBe(2);
    });
  },
};
