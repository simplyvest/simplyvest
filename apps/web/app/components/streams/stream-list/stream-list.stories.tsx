import type { StoryObj } from "@storybook/tanstack-react";
import { fn } from "storybook/test";

import { createMockPublicKey, createMockBN } from "../../../__tests__/story-mocks";
import { StreamList } from "./stream-list";

// -- mocks (hoisted by Vitest) --

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

vi.mock("@/hooks/use-stream", () => ({
  useStreams: () => ({ data: MOCK_STREAMS, isLoading: false }),
  useMilestoneStreams: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/use-transactions", () => ({
  useTriggerMilestone: () => ({ mutateAsync: fn(), isPending: false }),
  useWithdrawMilestone: () => ({ mutateAsync: fn(), isPending: false }),
  useCancelMilestone: () => ({ mutateAsync: fn(), isPending: false }),
  useCancel: () => ({ mutate: fn(), isPending: false, isError: false, error: null }),
  useWithdraw: () => ({ mutateAsync: fn(), isPending: false }),
  useCreateStream: () => ({ mutateAsync: fn(), isPending: false, isSuccess: false }),
  useCreateMilestoneStream: () => ({ mutateAsync: fn(), isPending: false, isSuccess: false }),
}));

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

vi.mock("@solana/spl-token", () => ({
  getAssociatedTokenAddressSync: () =>
    createMockPublicKey("mock_ata_11111111111111111111111111111"),
}));

vi.mock("@solana-tdp/sdk", () => ({
  getStatus: () => "active",
  getClaimable: () => createMockBN(550_000_000_000),
  getVaultPda: () => [createMockPublicKey("vault_pda_mock_44444444444444444444444444444444"), 255],
  formatAddress: (pk: { toBase58?: () => string }) => {
    const s = pk?.toBase58?.() ?? "";
    return `${s.slice(0, 4)}...${s.slice(-4)}`;
  },
  PROGRAM_ID: { toBase58: () => "ProgramId111111111111111111111111111" },
}));

// -- test data --

const MOCK_STREAMS = [
  {
    publicKey: createMockPublicKey("StreamPda1_11111111111111111111111111111"),
    account: {
      creator: createMockPublicKey("11111111111111111111111111111111"),
      recipient: createMockPublicKey("22222222222222222222222222222222"),
      mint: createMockPublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
      vault: createMockPublicKey("VaultPda1_11111111111111111111111111111"),
      amount: createMockBN(1_000_000_000_000),
      amountWithdrawn: createMockBN(250_000_000_000),
      startTime: createMockBN(1_700_000_000),
      cliffTime: createMockBN(1_700_000_000),
      endTime: createMockBN(1_800_000_000),
      vestingCount: createMockBN(0),
      cancelled: false,
      bump: 255,
      vaultBump: 255,
    },
  },
  {
    publicKey: createMockPublicKey("StreamPda2_22222222222222222222222222222"),
    account: {
      creator: createMockPublicKey("22222222222222222222222222222222"),
      recipient: createMockPublicKey("11111111111111111111111111111111"),
      mint: createMockPublicKey("So11111111111111111111111111111111111111112"),
      vault: createMockPublicKey("VaultPda2_22222222222222222222222222222"),
      amount: createMockBN(500_000_000_000),
      amountWithdrawn: createMockBN(0),
      startTime: createMockBN(1_700_000_000),
      cliffTime: createMockBN(1_700_000_000),
      endTime: createMockBN(1_800_000_000),
      vestingCount: createMockBN(0),
      cancelled: false,
      bump: 255,
      vaultBump: 255,
    },
  },
];

// -- meta --

const meta = {
  component: StreamList,
  args: { role: "created" },
};
export default meta;
type Story = StoryObj<typeof meta>;

// -- stories --

export const CreatedStreams: Story = {};

export const ReceivedStreams: Story = {
  args: { role: "received" },
};
