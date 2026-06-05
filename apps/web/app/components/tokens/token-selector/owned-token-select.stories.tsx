import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";
import { vi } from "vitest";

import type { TokenInfo } from "./use-owned-tokens";

import { OwnedTokenSelect } from "./owned-token-select";

// Mock Solana dependencies to avoid pulling in @solana/web3.js
// (which triggers a Buffer reference error in the browser test runner).
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

vi.mock("./use-owned-tokens", () => ({
  mintToAddress: (mint: { toBase58(): string } | null) => mint?.toBase58() ?? "",
}));

/** Lightweight stubs — only `toBase58()` is called by formatTokenLabel / mintToAddress. */
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const mockTokens = [
  {
    mint: { toBase58: () => "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
    balance: 100_000_000n,
    address: { toBase58: () => "11111111111111111111111111111111" },
    meta: { name: "USD Coin", symbol: "USDC" },
  },
  {
    mint: { toBase58: () => "So11111111111111111111111111111111111111112" },
    balance: 5_050_000_000n,
    address: { toBase58: () => "SysvarRent111111111111111111111111111111111" },
    meta: { name: "Wrapped SOL", symbol: "SOL" },
  },
] as never as TokenInfo[];

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const meta = {
  component: OwnedTokenSelect,
  args: {
    tokens: mockTokens,
    loading: false,
    value: "",
    onChange: fn(),
    onSwitchToCustom: fn(),
  },
} satisfies Meta<typeof OwnedTokenSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, step }) => {
    await step("renders select with token options", async () => {
      const select = canvas.getByRole("combobox");
      await expect(select).toBeInTheDocument();
      await expect(select).not.toBeDisabled();
      const options = canvas.getAllByRole("option");
      await expect(options.length).toBe(2);
    });

    await step("selecting a token fires onChange with its mint address", async () => {
      const select = canvas.getByRole("combobox");
      await userEvent.selectOptions(select, USDC_MINT);
      await expect(args.onChange).toHaveBeenCalledWith(USDC_MINT);
    });

    await step("clicking Custom button fires onSwitchToCustom", async () => {
      const customBtn = canvas.getByRole("button", { name: "Custom" });
      await userEvent.click(customBtn);
      await expect(args.onSwitchToCustom).toHaveBeenCalled();
    });
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  play: async ({ canvas, step }) => {
    await step("shows loading placeholder in select", async () => {
      const select = canvas.getByRole("combobox");
      await expect(select).toBeDisabled();
      const option = canvas.getByRole("option", { name: "Loading tokens..." });
      await expect(option).toBeInTheDocument();
    });

    await step("Custom button is still clickable", async () => {
      const customBtn = canvas.getByRole("button", { name: "Custom" });
      await expect(customBtn).not.toBeDisabled();
    });
  },
};

export const Empty: Story = {
  args: {
    tokens: [],
  },
  play: async ({ canvas, step }) => {
    await step("shows empty placeholder in select", async () => {
      const option = canvas.getByRole("option", { name: "No tokens found" });
      await expect(option).toBeInTheDocument();
    });
  },
};
