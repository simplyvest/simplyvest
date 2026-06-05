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

/** Mock wallet context state that components can consume via useWallet(). */
export function createMockWallet(overrides: Partial<WalletContextState> = {}): WalletContextState {
  return {
    autoConnect: false,
    connected: true,
    connecting: false,
    wallet: {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      adapter: {
        name: "MockWallet",
        icon: "",
        url: "",
        readyState: "Installed",
        supportedTransactionVersions: new Set(["legacy", 0]),
        publicKey: MOCK_PUBKEY,
        connect: async () => {},
        disconnect: async () => {},
        sendTransaction: async () => "",
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T) => tx,
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]) => txs,
        signMessage: async () => new Uint8Array(),
      } as never,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      readyState: "Installed" as never,
    },
    disconnecting: false,
    publicKey: MOCK_PUBKEY,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T) => tx,
    wallets: [],
    select: () => {},
    connect: async () => {},
    disconnect: async () => {},
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]) => txs,
    signMessage: async () => new Uint8Array(),
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    signIn: (async () => ({
      account: { address: "", chain: "solana" },
      signedMessage: new Uint8Array(),
      signature: new Uint8Array(),
    })) as never,
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
