import type { StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { createMockPublicKey } from "../../../__tests__/story-mocks";
import { MilestoneStreamCard } from "./milestone-stream-card";

const mockPk = (base58: string) => createMockPublicKey(base58);

const baseItem = {
  publicKey: mockPk("StreamPdaKey1111111111111111111111111111"),
  account: {
    creator: mockPk("11111111111111111111111111111111"),
    recipient: mockPk("22222222222222222222222222222222"),
    mint: mockPk("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    vault: mockPk("VaultPda_1111111111111111111111111111111"),
    milestoneAuthority: mockPk("MilestoneAuth1111111111111111111111111"),
    amount: { toString: () => "5000000" },
    amountWithdrawn: { toString: () => "0" },
    milestones: [],
    milestoneReached: false,
    cancelled: false,
    vestingCount: 1,
    bump: 255,
    vaultBump: 255,
  },
};

const baseArgs = {
  onTrigger: fn(),
  onCancel: fn(),
  onClaim: fn(),
  triggerPending: false,
  cancelPending: false,
  withdrawPending: false,
};

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const meta = {
  component: MilestoneStreamCard,
  args: {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    item: baseItem as never,
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
    await step("renders milestone stream label", async () => {
      await expect(canvas.getByText("Milestone stream")).toBeInTheDocument();
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
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    item: {
      ...baseItem,
      account: { ...baseItem.account, milestoneReached: true },
    } as never,
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
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    item: {
      ...baseItem,
      account: { ...baseItem.account, milestoneReached: true },
    } as never,
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
