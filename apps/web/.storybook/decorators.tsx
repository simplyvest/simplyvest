import type { WalletContextState } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { ThemeProvider } from "../app/lib/theme";

/**
 * Mock public key for use in stories.
 * Inval1dAdd9essThatLooksReal — base58 decodes to a valid 32-byte pubkey.
 */
export const MOCK_PUBKEY = new PublicKey("11111111111111111111111111111111");

type Wallet = NonNullable<WalletContextState["wallet"]>;
type WalletAdapter = Wallet["adapter"];

/** Mock wallet context state that components can consume via useWallet(). */
export function createMockWallet(overrides: Partial<WalletContextState> = {}): WalletContextState {
  const adapter: WalletAdapter = {
    name: "MockWallet",
    icon: "",
    url: "",
    iconDark: "",
    iconLight: "",
    readyState: "Installed",
    supportedTransactionVersions: new Set(["legacy", 0]),
    publicKey: MOCK_PUBKEY,
    connecting: false,
    connected: true,
    autoConnect: false,
    connect: async () => {},
    disconnect: async () => {},
    sendTransaction: async () => "",
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T) => tx,
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]) => txs,
    signMessage: async () => new Uint8Array(),
    on: () => {},
    removeListener: () => {},
    emit: () => false,
  };

  return {
    autoConnect: false,
    connected: true,
    connecting: false,
    disconnecting: false,
    publicKey: MOCK_PUBKEY,
    wallet: { adapter },
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T) => tx,
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]) => txs,
    signMessage: async () => new Uint8Array(),
    sendTransaction: async () => "",
    ...overrides,
  };
}

/**
 * Storybook decorator that provides the minimal provider chain
 * needed by most components: QueryClient + Theme + Mock Solana wallet.
 *
 * Usage in story files:
 * ```ts
 * import { withProviders } from "../../../.storybook/decorators";
 *
 * const meta = {
 *   component: MyComponent,
 *   decorators: [withProviders],
 * } satisfies Meta<typeof MyComponent>;
 * ```
 */
export function withProviders(Story: () => ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
