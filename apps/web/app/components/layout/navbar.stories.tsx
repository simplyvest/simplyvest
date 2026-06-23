import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { withProviders } from "@/.storybook/decorators";

import { Navbar } from "./navbar";

vi.mock("@/lib/solana/use-auth", () => ({
  useAuth: () => ({
    connected: false,
    connecting: false,
    publicKey: null,
    user: null,
  }),
}));

vi.mock("@privy-io/react-auth", () => ({
  useLogin: () => ({ login: () => {} }),
  useLogout: () => ({ logout: () => {} }),
}));

const meta = {
  component: Navbar,
  decorators: [withProviders],
} satisfies Meta<typeof Navbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
