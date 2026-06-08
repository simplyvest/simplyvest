import type { StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { createMockStreamAccount, mockPK, mockBN } from "@/__tests__/story-mocks";

import { StreamCard } from "./stream-card";

// -- mocks (hoisted by Vitest) --

vi.mock("@solana/web3.js", () => ({
  PublicKey: class {
    value: string;
    constructor(val: string) {
      this.value = val;
    }
    toBase58() {
      return this.value;
    }
  },
}));

vi.mock("@/lib/solana/use-auth", () => {
  const PK = "11111111111111111111111111111111";
  return {
    useAuth: () => ({
      connected: true,
      connecting: false,
      publicKey: {
        toBase58: () => PK,
        equals: (other: { toBase58?: () => string }) => other?.toBase58?.() === PK,
      },
      user: null,
    }),
  };
});

vi.mock("@/hooks/tx/use-withdraw", () => ({
  useWithdraw: () => ({
    mutate: fn(),
    mutateAsync: fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

vi.mock("@solana/spl-token", () => ({
  getAssociatedTokenAddressSync: () => ({ toBase58: () => "mock_ata" }),
}));

const CLAIMABLE_BN = mockBN(550_000_000_000);

vi.mock("@solana-tdp/sdk", () => ({
  getStatus: () => "active",
  getClaimable: () => CLAIMABLE_BN,
  getVaultPda: () => [{ toBase58: () => "vault_pda_mock" }, 255],
  formatAddress: (pk: { toBase58?: () => string }) => {
    const s = pk?.toBase58?.() ?? "";
    return `${s.slice(0, 4)}...${s.slice(-4)}`;
  },
  PROGRAM_ID: { toBase58: () => "ProgramId111111111111111111111111111" },
}));

// -- helpers --

const WALLET_PK = "11111111111111111111111111111111";
const CREATOR_PK = WALLET_PK;
const RECIPIENT_PK = "22222222222222222222222222222222";

const baseStream = createMockStreamAccount();
const streamForReceived = createMockStreamAccount({
  creator: mockPK(RECIPIENT_PK),
  recipient: mockPK(CREATOR_PK),
});

// -- meta --

const meta = {
  component: StreamCard,
  args: {
    stream: baseStream,
    pda: mockPK(WALLET_PK),
    onCancel: fn(),
    role: "created",
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

// -- stories --

export const Created: Story = {
  play: async ({ canvas, step }) => {
    await step("renders active status badge", async () => {
      await expect(canvas.getByText("active")).toBeInTheDocument();
    });
    await step("renders token amount", async () => {
      await expect(canvas.getByText("1,000,000.00")).toBeInTheDocument();
    });
  },
};

export const Received: Story = {
  args: {
    stream: streamForReceived,
    role: "received",
    onCancel: fn(),
  },
  play: async ({ canvas, step }) => {
    await step("renders active status badge", async () => {
      await expect(canvas.getByText("active")).toBeInTheDocument();
    });
    await step("renders token amount", async () => {
      await expect(canvas.getByText("1,000,000.00")).toBeInTheDocument();
    });
  },
};
