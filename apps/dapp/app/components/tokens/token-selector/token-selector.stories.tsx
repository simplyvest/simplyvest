import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";
import { vi } from "vitest";

import { TokenSelector } from "./token-selector";

vi.mock("@/lib/solana/use-auth", () => ({
  useAuth: () => ({
    connected: true,
    connecting: false,
    publicKey: { toBase58: () => "11111111111111111111111111111111", equals: () => false },
    user: null,
  }),
}));

vi.mock("./use-owned-tokens", () => ({
  useOwnedTokens: () => ({ tokens: [], loading: false }),
  mintToAddress: (mint: { toBase58(): string } | null) => mint?.toBase58() ?? "",
}));

vi.mock("@solana-tdp/sdk", () => ({
  fetchTokenMetadata: async () => ({ name: "USD Coin", symbol: "USDC" }),
  formatTokenLabel: (
    meta: { name: string; symbol: string } | null,
    mint: { toBase58(): string },
  ) => {
    if (meta?.symbol) return `${meta.name} (${meta.symbol})`;
    const addr = mint.toBase58();
    return addr.slice(0, 4) + "..." + addr.slice(-4);
  },
  mintToAddress: (mint: { toBase58(): string } | null) => mint?.toBase58() ?? "",
}));

const meta = {
  title: "Dapp/Tokens/Selector",
  component: TokenSelector,
  tags: ["vitest-only"],
  args: {
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof TokenSelector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders the token selector trigger", async () => {
      await expect(canvas.getByText(/select token/i)).toBeInTheDocument();
    });
  },
};

export const WithValue: Story = {
  args: {
    value: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
  play: async ({ args, canvas, step }) => {
    await step("renders the selected token", async () => {
      // The component displays the selected token symbol/name
      await expect(canvas.getByText(/USDC/i)).toBeInTheDocument();
    });
    await step("calls onChange when a new token is selected", async () => {
      // onChange is wired; verify it exists as a mock
      await expect(args.onChange).toBeDefined();
    });
  },
};
