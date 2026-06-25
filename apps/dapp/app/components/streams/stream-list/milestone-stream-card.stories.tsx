import type { StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import type { StreamWithEvents } from "@/hooks/use-stream-api";

import { MilestoneStreamCard } from "./milestone-stream-card";

vi.mock("@solana/web3.js", () => ({
  // oxlint-disable-next-line typescript/no-extraneous-class
  PublicKey: class {},
}));

const baseStream: StreamWithEvents = {
  id: "7NX7RrJpvnXYsBgvGMjRpfLgHsJhMhYHkLqg2Qz3Vn2",
  type: "milestone",
  creatorAddress: "11111111111111111111111111111111",
  recipientAddress: "22222222222222222222222222222222",
  mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  vaultAddress: "Vault1111111111111111111111111111111111",
  amount: "5000000",
  milestoneAuthority: "33333333333333333333333333333333",
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

const baseArgs = {
  onTrigger: fn(),
  onCancel: fn(),
  onClaim: fn(),
  triggerPending: false,
  cancelPending: false,
  withdrawPending: false,
};

const meta = {
  title: "Dapp/Streams/Milestone Card",
  component: MilestoneStreamCard,
  args: {
    stream: baseStream,
    ...baseArgs,
    role: "created",
    isRecipient: false,
    canTrigger: false,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const CreatedActive: Story = {
  play: async ({ canvas, step }) => {
    await step("renders active badge", async () => {
      await expect(canvas.getByText("active")).toBeInTheDocument();
    });
    await step("renders Cancel button for creator", async () => {
      await expect(canvas.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
    await step("does not render Claim or Complete buttons", async () => {
      await expect(canvas.queryByRole("button", { name: /claim/i })).not.toBeInTheDocument();
      await expect(
        canvas.queryByRole("button", { name: /complete milestone/i }),
      ).not.toBeInTheDocument();
    });
  },
};

export const CreatedCancelPending: Story = {
  args: { cancelPending: true },
  play: async ({ canvas, step }) => {
    await step("shows Cancelling text on disabled button", async () => {
      const btn = canvas.getByRole("button", { name: /cancelling/i });
      await expect(btn).toBeDisabled();
    });
  },
};

export const MilestoneReachedCreator: Story = {
  args: {
    stream: {
      ...baseStream,
      milestoneReached: true,
    },
    canTrigger: true,
  },
  play: async ({ canvas, step }) => {
    await step("renders completed badge", async () => {
      await expect(canvas.getByText("completed")).toBeInTheDocument();
    });
    await step("shows Complete Milestone button", async () => {
      await expect(canvas.getByRole("button", { name: /complete milestone/i })).toBeInTheDocument();
    });
    await step("Cancel button is hidden for completed milestone", async () => {
      await expect(canvas.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });
  },
};

export const MilestoneReachedRecipient: Story = {
  args: {
    stream: {
      ...baseStream,
      milestoneReached: true,
    },
    role: "received",
    isRecipient: true,
    canTrigger: false,
  },
  play: async ({ canvas, step }) => {
    await step("renders completed badge", async () => {
      await expect(canvas.getByText("completed")).toBeInTheDocument();
    });
    await step("shows Claim button for recipient", async () => {
      await expect(canvas.getByRole("button", { name: /claim/i })).toBeInTheDocument();
    });
  },
};

export const TriggerPending: Story = {
  args: { canTrigger: true, triggerPending: true },
  play: async ({ canvas, step }) => {
    await step("shows Completing text on disabled button", async () => {
      const btn = canvas.getByRole("button", { name: /completing/i });
      await expect(btn).toBeDisabled();
    });
  },
};
