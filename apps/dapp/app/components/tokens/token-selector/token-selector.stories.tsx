import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn } from "storybook/test";
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
  component: TokenSelector,
  args: {
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof TokenSelector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
