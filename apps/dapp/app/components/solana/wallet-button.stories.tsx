import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn, expect } from "storybook/test";

import { AuthButton } from "./wallet-button";

vi.mock("@/lib/solana/use-auth", () => ({
  useAuth: () => ({
    connected: false,
    connecting: false,
    publicKey: null,
    user: null,
  }),
}));

vi.mock("@privy-io/react-auth", () => ({
  useLogin: () => ({ login: fn() }),
  useLogout: () => ({ logout: fn() }),
}));

const meta = {
  title: "Dapp/Auth",
  component: AuthButton,
} satisfies Meta<typeof AuthButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  play: async ({ canvas, step }) => {
    await step("shows Log In button", async () => {
      await expect(canvas.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    });
  },
};
