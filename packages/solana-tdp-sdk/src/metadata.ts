import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

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
    const name = data.slice(offset, offset + nameLen).toString("utf8");
    offset += nameLen;

    const symbolLen = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.slice(offset, offset + symbolLen).toString("utf8");

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
  const addr = pk.toBase58();
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}
