import type { StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";
import { vi } from "vitest";

import {
  createMockPublicKey,
  createMockBN,
  createMockUseWallet,
  createPublicKeyClass,
} from "../../../__tests__/story-mocks";
import { StreamCard } from "./stream-card";

// -- mocks (hoisted by Vitest) --

vi.mock("@solana/web3.js", () => ({
  PublicKey: createPublicKeyClass(),
}));

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => createMockUseWallet(WALLET_PK),
  useConnection: () => ({ connection: {} }),
}));

vi.mock("@/hooks/use-transactions", () => ({
  useWithdraw: () => ({
    mutate: fn(),
    mutateAsync: fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

vi.mock("@solana/spl-token", () => ({
  getAssociatedTokenAddressSync: fn().mockReturnValue({ toBase58: () => "mock_ata" }),
}));

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const CLAIMABLE_BN = createMockBN(550_000_000_000);

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

const baseStream = {
  creator: createMockPublicKey(CREATOR_PK),
  recipient: createMockPublicKey(RECIPIENT_PK),
  mint: createMockPublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  vault: createMockPublicKey("33333333333333333333333333333333"),
  amount: createMockBN(1_000_000_000_000),
  amountWithdrawn: createMockBN(250_000_000_000),
  startTime: createMockBN(1_700_000_000),
  cliffTime: createMockBN(1_700_000_000),
  endTime: createMockBN(1_800_000_000),
  vestingCount: createMockBN(0),
  cancelled: false,
  bump: 255,
  vaultBump: 255,
};

const streamForReceived = {
  ...baseStream,
  creator: createMockPublicKey(RECIPIENT_PK),
  recipient: createMockPublicKey(CREATOR_PK),
};

// -- meta --

const meta = {
  component: StreamCard,
  args: {
    stream: baseStream,
    pda: createMockPublicKey(WALLET_PK),
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
    await step("renders Cancel button for creator role", async () => {
      await expect(canvas.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
    await step("does not render Claim button", async () => {
      await expect(canvas.queryByRole("button", { name: /claim/i })).not.toBeInTheDocument();
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
    await step("renders Claim button for recipient role", async () => {
      await expect(canvas.getByRole("button", { name: /claim/i })).toBeInTheDocument();
    });
    await step("does not render Cancel button", async () => {
      await expect(canvas.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });
  },
};
