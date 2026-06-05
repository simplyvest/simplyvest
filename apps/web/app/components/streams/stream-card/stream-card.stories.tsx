import type { StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

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

vi.mock("@solana/wallet-adapter-react", () => {
  const PK = "11111111111111111111111111111111";
  return {
    useWallet: () => ({
      connected: true,
      publicKey: {
        toBase58: () => PK,
        equals: (other: { toBase58?: () => string }) => other?.toBase58?.() === PK,
      },
    }),
    useConnection: () => ({ connection: {} }),
  };
});

vi.mock("@/hooks/use-transactions", () => ({
  useWithdraw: () => ({
    mutate: fn(),
    mutateAsync: fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

vi.mock("@solana/spl-token", () => ({
  getAssociatedTokenAddressSync: () => ({ toBase58: () => "mock_ata" }),
}));

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const CLAIMABLE_BN = { toNumber: () => 550_000_000_000 } as never;

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

const mockPK = (base58: string) => ({ toBase58: () => base58 });

const mockBN = (n: number) => ({
  toNumber: () => n,
  valueOf: () => n,
  sub: (other: { toNumber?: () => number }) => mockBN(n - (other?.toNumber?.() ?? 0)),
});

const baseStream = {
  creator: mockPK(CREATOR_PK),
  recipient: mockPK(RECIPIENT_PK),
  mint: mockPK("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  vault: mockPK("33333333333333333333333333333333"),
  amount: mockBN(1_000_000_000_000),
  amountWithdrawn: mockBN(250_000_000_000),
  startTime: mockBN(1_700_000_000),
  cliffTime: mockBN(1_700_000_000),
  endTime: mockBN(1_800_000_000),
  vestingCount: mockBN(0),
  cancelled: false,
  bump: 255,
  vaultBump: 255,
};

const streamForReceived = {
  ...baseStream,
  creator: mockPK(RECIPIENT_PK),
  recipient: mockPK(CREATOR_PK),
};

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
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    stream: streamForReceived as never,
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
