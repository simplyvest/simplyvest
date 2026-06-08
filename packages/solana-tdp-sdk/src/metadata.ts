import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
export function formatAddress(pubkey: PublicKey | string, chars = 4): string {
  const s = typeof pubkey === "string" ? pubkey : pubkey.toBase58();
  return `${s.slice(0, chars)}...${s.slice(-chars)}`;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
}

export async function fetchTokenMetadata(
  connection: Connection,
  mint: PublicKey,
): Promise<TokenMetadata | null> {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID,
  );

  const info = await connection.getAccountInfo(pda);
  if (!info) return null;

  try {
    const data = info.data;
    let offset = 1 + 32 + 32;
    const nameLen = data.readUInt32LE(offset);
    offset += 4;
    const name = data
      .subarray(offset, offset + nameLen)
      .toString("utf8")
      .split("\0")
      .join("");
    offset += nameLen;

    const symbolLen = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data
      .subarray(offset, offset + symbolLen)
      .toString("utf8")
      .split("\0")
      .join("");

    return { name, symbol };
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
