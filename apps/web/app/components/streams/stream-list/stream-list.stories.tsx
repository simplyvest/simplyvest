import type { StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";
import { vi } from "vitest";

import {
  createMockPublicKey,
  createMockUseWallet,
  createPublicKeyClass,
  createMockBN,
} from "../../../__tests__/story-mocks";
import { StreamList } from "./stream-list";

// -- mocks (hoisted by Vitest) --

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => createMockUseWallet("11111111111111111111111111111111"),
  useConnection: () => ({ connection: {} }),
}));

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
  PublicKey: createPublicKeyClass(),
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

export const CreatedStreams: Story = {
  play: async ({ canvas, step }) => {
    await step("renders stream cards for creator role", async () => {
      await expect(canvas.getByText("1,000,000.00")).toBeInTheDocument();
    });
    await step("renders active badge", async () => {
      const badges = canvas.getAllByText("active");
      await expect(badges.length).toBe(1);
    });
    await step("renders token address", async () => {
      await expect(canvas.getByText(/EPjF/)).toBeInTheDocument();
    });
  },
};

export const ReceivedStreams: Story = {
  args: { role: "received" },
  play: async ({ canvas, step }) => {
    await step("renders stream cards for received role", async () => {
      await expect(canvas.getByText("500,000.00")).toBeInTheDocument();
    });
  },
};
