import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";

export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
}

export function formatAddress(pubkey: PublicKey | string, chars = 4): string {
  const s = typeof pubkey === "string" ? pubkey : pubkey.toBase58();
  return `${s.slice(0, chars)}...${s.slice(-chars)}`;
}

export async function fetchTokenMetadata(
  connection: Connection,
  mint: PublicKey,
): Promise<TokenMetadata | null> {
  try {
    const umi = createUmi(connection.rpcEndpoint);
    const asset = await fetchDigitalAsset(umi, publicKey(mint.toBase58()));
    return {
      name: asset.metadata.name,
      symbol: asset.metadata.symbol,
      uri: asset.metadata.uri,
    };
  } catch {
    return null;
  }
}

export function formatTokenLabel(
  metadata: TokenMetadata | null | undefined,
  mint: PublicKey,
): string {
  if (metadata?.symbol) return `${metadata.name} (${metadata.symbol})`;
  const addr = mint.toBase58();
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

export function shortAddress(pk: PublicKey): string {
  return formatAddress(pk, 4);
}
