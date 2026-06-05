import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, userEvent, expect } from "storybook/test";

import {
  createMockPublicKey,
  createMockUseWallet,
  createPublicKeyClass,
} from "../../../__tests__/story-mocks";
import { CreateStreamForm } from "./create-stream-form";

// -- mocks (hoisted by Vitest) --

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => createMockUseWallet(),
  useConnection: () => ({ connection: {} }),
}));

vi.mock("@/hooks/use-transactions", () => ({
  useCreateStream: () => ({
    mutateAsync: fn().mockResolvedValue("mock_tx_sig"),
    mutate: fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
  }),
  useCreateMilestoneStream: () => ({
    mutateAsync: fn().mockResolvedValue("mock_tx_sig"),
    mutate: fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
  }),
}));

vi.mock("@/components/tokens/token-selector/use-owned-tokens", () => ({
  useOwnedTokens: () => ({ tokens: [], loading: false }),
  mintToAddress: () => "",
}));

vi.mock("@solana/spl-token", () => ({
  getAssociatedTokenAddressSync: () =>
    createMockPublicKey("mock_ata_11111111111111111111111111111"),
  ASSOCIATED_TOKEN_PROGRAM_ID: { toBase58: () => "AToken..." },
  TOKEN_PROGRAM_ID: { toBase58: () => "Tokenkeg..." },
}));

vi.mock("@solana/web3.js", () => ({
  PublicKey: createPublicKeyClass(),
}));

// -- meta --

const meta = {
  component: CreateStreamForm,
} satisfies Meta<typeof CreateStreamForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- stories --

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders form heading", async () => {
      await expect(canvas.getByText("Create Stream")).toBeInTheDocument();
    });

    await step("renders stream type toggle", async () => {
      await expect(canvas.getByText("Time-based Vesting")).toBeInTheDocument();
      await expect(canvas.getByText("Milestone-gated")).toBeInTheDocument();
    });

    await step("renders recipient field", async () => {
      await expect(canvas.getByPlaceholderText("Wallet address")).toBeInTheDocument();
    });

    await step("renders token selector with no owned tokens", async () => {
      await expect(canvas.getByText("No tokens found")).toBeInTheDocument();
      await expect(canvas.getByText("Custom")).toBeInTheDocument();
    });

    await step("renders amount field", async () => {
      await expect(canvas.getByPlaceholderText("1000")).toBeInTheDocument();
    });

    await step("renders time fields for time-based stream", async () => {
      await expect(canvas.getByText("Start Date/Time")).toBeInTheDocument();
      await expect(canvas.getByText("End Date/Time")).toBeInTheDocument();
      await expect(canvas.getByText("Cliff Date/Time (optional)")).toBeInTheDocument();
    });

    await step("renders submit button as disabled initially", async () => {
      await expect(canvas.getByRole("button", { name: /create stream/i })).toBeDisabled();
    });

    await step("renders reset button", async () => {
      await expect(canvas.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });
  },
};

export const TypeInFields: Story = {
  play: async ({ canvas, step }) => {
    await step("type a recipient address", async () => {
      const input = canvas.getByPlaceholderText("Wallet address");
      await userEvent.type(input, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      await expect(input).toHaveValue("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    });

    await step("type an amount", async () => {
      const input = canvas.getByPlaceholderText("1000");
      await userEvent.type(input, "500");
      await expect(input).toHaveValue(500);
    });
  },
};

export const SwitchToMilestone: Story = {
  play: async ({ canvas, step }) => {
    await step("time fields visible by default", async () => {
      await expect(canvas.getByText("Start Date/Time")).toBeInTheDocument();
      await expect(canvas.getByText("End Date/Time")).toBeInTheDocument();
    });

    await step("switch to milestone type", async () => {
      await userEvent.click(canvas.getByText("Milestone-gated"));
    });

    await step("time fields are hidden for milestone", async () => {
      await expect(canvas.queryByText("Start Date/Time")).not.toBeInTheDocument();
      await expect(canvas.queryByText("End Date/Time")).not.toBeInTheDocument();
      await expect(canvas.queryByText("Cliff Date/Time (optional)")).not.toBeInTheDocument();
    });

    await step("submit button text changes for milestone", async () => {
      await expect(
        canvas.getByRole("button", { name: /create milestone stream/i }),
      ).toBeInTheDocument();
    });
  },
};

export const SwitchToCustomToken: Story = {
  play: async ({ canvas, step }) => {
    await step("click Custom button to switch token input mode", async () => {
      await userEvent.click(canvas.getByText("Custom"));
    });

    await step("custom token mint address input appears", async () => {
      await expect(canvas.getByPlaceholderText(/enter spl token mint/i)).toBeInTheDocument();
      await expect(canvas.getByText("Owned")).toBeInTheDocument();
    });

    await step("type a token mint address", async () => {
      const input = canvas.getByPlaceholderText(/enter spl token mint/i);
      await userEvent.type(input, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      await expect(input).toHaveValue("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    });

    await step("switch back to owned mode", async () => {
      await userEvent.click(canvas.getByText("Owned"));
      await expect(canvas.getByText("No tokens found")).toBeInTheDocument();
    });
  },
};

export const ShowsValidationError: Story = {
  play: async ({ canvas, step }) => {
    await step("type invalid recipient address", async () => {
      const input = canvas.getByPlaceholderText("Wallet address");
      await userEvent.type(input, "not-a-valid-address");
    });

    await step("validation error appears", async () => {
      await expect(canvas.getByText("Invalid recipient address")).toBeInTheDocument();
    });

    await step("submit button remains disabled", async () => {
      await expect(canvas.getByRole("button", { name: /create stream/i })).toBeDisabled();
    });
  },
};

export const ResetForm: Story = {
  play: async ({ canvas, step }) => {
    await step("fill in recipient field", async () => {
      const input = canvas.getByPlaceholderText("Wallet address");
      await userEvent.type(input, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      await expect(input).toHaveValue("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    });

    await step("fill in amount field", async () => {
      const input = canvas.getByPlaceholderText("1000");
      await userEvent.type(input, "500");
      await expect(input).toHaveValue(500);
    });

    await step("click reset clears all fields", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /reset/i }));
      await expect(canvas.getByPlaceholderText("Wallet address")).toHaveValue("");
      await expect(canvas.getByPlaceholderText("1000")).toHaveValue(null);
    });

    await step("submit button is disabled after reset", async () => {
      await expect(canvas.getByRole("button", { name: /create stream/i })).toBeDisabled();
    });
  },
};
