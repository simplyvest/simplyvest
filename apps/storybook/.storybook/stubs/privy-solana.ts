// Storybook stub for @privy-io/react-auth/solana
// Prevents "Cannot read properties of null (reading 'connectors')" crashes.

export function toSolanaWalletConnectors() {
  return [];
}

export function useWallets() {
  return { wallets: [] };
}

export function useSignTransaction() {
  return { signTransaction: async () => ({ signature: "stub" }) };
}

export function useSignAndSendTransaction() {
  return { signAndSendTransaction: async () => ({ signature: "stub" }) };
}

export function useExportWallet() {
  return { exportWallet: () => {} };
}
