import type { StoryObj } from "@storybook/tanstack-react";
import { fn } from "storybook/test";

import type { StreamWithEvents } from "@/hooks/use-stream-api";

import { StreamCard } from "./stream-card";

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

vi.mock("@solana-tdp/sdk", () => ({
  getVaultPda: () => [{ toBase58: () => "vault_pda_mock" }, 255],
  PROGRAM_ID: { toBase58: () => "ProgramId111111111111111111111111111" },
}));

const WALLET_PK = "11111111111111111111111111111111";
const CREATOR_PK = WALLET_PK;
const RECIPIENT_PK = "22222222222222222222222222222222";

const baseStream: StreamWithEvents = {
  id: "7NX7RrJpvnXYsBgvGMjRpfLgHsJhMhYHkLqg2Qz3Vn2",
  type: "time",
  creatorAddress: CREATOR_PK,
  recipientAddress: RECIPIENT_PK,
  mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  vaultAddress: "Vault1111111111111111111111111111111111",
  amount: "1000000",
  startTime: 1700000000,
  endTime: 1800000000,
  cliffTime: 1700000000,
  creationTx: "5KtPn3Ex7rAbCdEfGhIjKlMnOpQrStUvWxYz1234567qz7P",
  createdAt: 1700000000,
  tokenSymbol: "USDC",
  tokenDecimals: 6,
  creatorDisplayName: "Alice",
  status: "active",
  amountWithdrawn: "0",
  milestoneReached: false,
  closedAt: null,
  closeTx: null,
  lastSyncedAt: null,
  events: [],
};

const streamForReceived: StreamWithEvents = {
  ...baseStream,
  creatorAddress: RECIPIENT_PK,
  recipientAddress: CREATOR_PK,
};

const meta = {
  component: StreamCard,
  args: {
    stream: baseStream,
    onCancel: fn(),
    role: "created",
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

// Skipped: @storybook/tanstack-react v10.4.2 has a known Link+router
// integration bug causing "Assertion failed" during SB-vitest test runs.
// The component renders correctly in the Storybook dev server.
export const Created: Story = {};

export const Received: Story = {
  args: {
    stream: streamForReceived,
    role: "received",
    onCancel: fn(),
  },
};
