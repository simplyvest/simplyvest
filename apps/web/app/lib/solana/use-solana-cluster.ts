/**
 * Returns the Solana cluster name for explorer URLs.
 * Maps VITE_SOLANA_CHAIN to "devnet" or "mainnet-beta".
 */
export function useSolanaCluster(): "devnet" | "mainnet-beta" {
  const chain = import.meta.env.VITE_SOLANA_CHAIN ?? "solana:devnet";
  return chain === "solana:mainnet" ? "mainnet-beta" : "devnet";
}
