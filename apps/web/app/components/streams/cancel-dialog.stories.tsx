import type { StoryObj } from "@storybook/tanstack-react";
import BN from "bn.js";
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

const cancelState = {
  mutate: fn(),
  isPending: false,
  isError: false,
  error: null as Error | null,
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
  formatAddress: (pk: { toBase58: () => string }) => {
    const s = pk.toBase58();
    return `${s.slice(0, 4)}...${s.slice(-4)}`;
  },
}));

vi.mock("@/utils/format", () => ({
  formatSol: (lamports: { toNumber: () => number } | number, decimals = 9) => {
    const n = typeof lamports === "number" ? lamports : lamports.toNumber();
    return (n / 10 ** decimals).toFixed(2);
  },
}));

// -- test data --

const MOCK_STREAM = {
  creator: { toBase58: () => "CREATOR_ADDR1111111111111111111111111" },
  recipient: { toBase58: () => "RECIP_ADDR_1111111111111111111111111" },
  mint: { toBase58: () => "MINT_ADDR___1111111111111111111111111" },
  vault: { toBase58: () => "VAULT_ADDR__1111111111111111111111111" },
  amount: new BN(1_000_000_000),
  amountWithdrawn: new BN(250_000_000),
  startTime: new BN(1700000000),
  cliffTime: new BN(1700000000),
  endTime: new BN(1800000000),
  vestingCount: new BN(1),
  cancelled: false,
  bump: 255,
  vaultBump: 255,
};

const MOCK_PDA = {
  toBase58: () => "PDA_ADDR_1111111111111111111111111111111",
};

// -- meta --

const meta = {
  component: CancelDialog,
  args: {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    stream: MOCK_STREAM as never,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    pda: MOCK_PDA as never,
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

    await step("renders stream summary labels", async () => {
      await expect(canvas.getByText("Stream")).toBeInTheDocument();
      await expect(canvas.getByText("Recipient")).toBeInTheDocument();
      await expect(canvas.getByText("Total Amount")).toBeInTheDocument();
      await expect(canvas.getByText("Withdrawn")).toBeInTheDocument();
    });

    await step("renders formatted amounts", async () => {
      // 1_000_000_000 lamports / 10^6 = 1000.00
      await expect(canvas.getByText("1000.00")).toBeInTheDocument();
      // 250_000_000 lamports / 10^6 = 250.00
      await expect(canvas.getByText("250.00")).toBeInTheDocument();
    });

    await step("renders Keep Stream button enabled", async () => {
      const btn = canvas.getByRole("button", { name: /keep stream/i });
      await expect(btn).toBeInTheDocument();
      await expect(btn).not.toBeDisabled();
    });

    await step("renders Confirm Cancel button enabled", async () => {
      const btn = canvas.getByRole("button", { name: /confirm cancel/i });
      await expect(btn).toBeInTheDocument();
      await expect(btn).not.toBeDisabled();
    });
  },
};

export const Pending: Story = {
  decorators: [
    (Story) => {
      cancelState.isPending = true;
      cancelState.isError = false;
      cancelState.error = null;
      return <Story />;
    },
  ],
  play: async ({ canvas, step }) => {
    await step("shows Cancelling text on destructive button", async () => {
      await expect(canvas.getByRole("button", { name: /cancelling/i })).toBeInTheDocument();
    });

    await step("Cancelling button is disabled", async () => {
      await expect(canvas.getByRole("button", { name: /cancelling/i })).toBeDisabled();
    });

    await step("Keep Stream button is disabled", async () => {
      await expect(canvas.getByRole("button", { name: /keep stream/i })).toBeDisabled();
    });

    await step("shows wallet approval waiting message", async () => {
      await expect(
        canvas.getByText(/Waiting for wallet approval and confirmation/),
      ).toBeInTheDocument();
    });
  },
};

export const WithError: Story = {
  decorators: [
    (Story) => {
      cancelState.isPending = false;
      cancelState.isError = true;
      cancelState.error = new Error("Transaction failed: user rejected");
      return <Story />;
    },
  ],
  play: async ({ canvas, step }) => {
    await step("shows error message", async () => {
      await expect(canvas.getByText("Transaction failed: user rejected")).toBeInTheDocument();
    });

    await step("buttons remain enabled after error", async () => {
      await expect(canvas.getByRole("button", { name: /keep stream/i })).not.toBeDisabled();
      await expect(canvas.getByRole("button", { name: /confirm cancel/i })).not.toBeDisabled();
    });
  },
};
