import type { StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { CancelDialog } from "./cancel-dialog";

// -- mocks (hoisted by Vitest) --

vi.mock("@/lib/solana/use-auth", () => {
  const PK = "11111111111111111111111111111111";
  return {
    useAuth: () => ({
      connected: true,
      connecting: false,
      publicKey: { toBase58: () => PK, equals: () => false },
      user: null,
    }),
  };
});

const cancelState: {
  mutate: ReturnType<typeof fn>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} = {
  mutate: fn(),
  isPending: false,
  isError: false,
  error: null,
};

vi.mock("@/hooks/tx/use-cancel", () => ({
  useCancel: () => cancelState,
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
  getAssociatedTokenAddressSync: () => ({
    toBase58: () => "mock_ata_11111111111111111111111111111",
  }),
}));
vi.mock("@solana-tdp/sdk", () => ({
  getVaultPda: () => [{ toBase58: () => "vault_pda_addr" }, 255],
  PROGRAM_ID: { toBase58: () => "TDP_PROGRAM_ID111111111111111111111111111111" },
}));

vi.mock("@/utils/format", () => ({
  formatSol: (lamports: { toNumber: () => number } | number, decimals = 9) => {
    const n = typeof lamports === "number" ? lamports : lamports.toNumber();
    return (n / 10 ** decimals).toFixed(2);
  },
}));

// -- test data --

const MOCK_STREAM = {
  id: "7NX7RrJpvnXYsBgvGMjRpfLgHsJhMhYHkLqg2Qz3Vn2",
  type: "time" as const,
  creatorAddress: "11111111111111111111111111111111",
  recipientAddress: "22222222222222222222222222222222",
  mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  vaultAddress: "33333333333333333333333333333333",
  amount: "1000000000",
  amountWithdrawn: "250000000",
  startTime: 1700000000,
  endTime: 1800000000,
  cliffTime: 1700000000,
  tokenSymbol: "USDC",
  tokenDecimals: 6,
  creatorDisplayName: "Alice",
  status: "active" as const,
  milestoneReached: false,
  closedAt: null,
  closeTx: null,
  creationTx: "5KtPn3Ex7rAbCdEfGhIjKlMnOpQrStUvWxYz1234567qz7P",
  createdAt: 1700000000,
  lastSyncedAt: null,
  events: [],
};

const MOCK_PDA = { toBase58: () => "PDA_ADDR_1111111111111111111111111111111" };

// -- meta --

const meta = {
  title: "Dapp/Streams/Cancel Dialog",
  component: CancelDialog,
  tags: ["vitest-only"],
  args: {
    stream: MOCK_STREAM,
    pda: MOCK_PDA,
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// -- stories --

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("renders dialog heading", async () => {
      await expect(canvas.getByText("Cancel Stream")).toBeInTheDocument();
    });

    await step("renders description", async () => {
      await expect(
        canvas.getByText(/This will send the vested tokens to the recipient/),
      ).toBeInTheDocument();
    });

    await step("shows stream details", async () => {
      await expect(canvas.getByText("Total Amount")).toBeInTheDocument();
      await expect(canvas.getByText("1000.00")).toBeInTheDocument();
    });

    await step("shows action buttons", async () => {
      await expect(canvas.getByRole("button", { name: /keep stream/i })).toBeInTheDocument();
      await expect(canvas.getByRole("button", { name: /confirm cancel/i })).toBeInTheDocument();
    });
  },
};

export const CancelPending: Story = {
  args: {
    onClose: fn(),
  },
  beforeEach: () => {
    cancelState.isPending = true;
    return () => {
      cancelState.isPending = false;
    };
  },
  play: async ({ canvas, step }) => {
    await step("shows cancelling text on confirm button", async () => {
      const btn = canvas.getByRole("button", { name: /cancelling/i });
      await expect(btn).toBeDisabled();
    });

    await step("keep stream button is also disabled", async () => {
      const btn = canvas.getByRole("button", { name: /keep stream/i });
      await expect(btn).toBeDisabled();
    });

    await step("shows waiting message", async () => {
      await expect(canvas.getByText(/Waiting for wallet approval/)).toBeInTheDocument();
    });
  },
};

export const CancelError: Story = {
  args: {
    onClose: fn(),
  },
  beforeEach: () => {
    cancelState.isError = true;
    cancelState.error = new Error("User rejected the transaction");
    return () => {
      cancelState.isError = false;
      cancelState.error = null;
    };
  },
  play: async ({ canvas, step }) => {
    await step("shows error message", async () => {
      await expect(canvas.getByText("User rejected the transaction")).toBeInTheDocument();
    });
  },
};
