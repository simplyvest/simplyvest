import { utils } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";

import type { StreamAccount, MilestoneStreamAccount } from "./types/runtime";

import { decodeStreamAccount, decodeMilestoneStreamAccount } from "./decode";
import SolanaTdpIdl from "./idl/solana_tdp.json";

const PROGRAM_ID = new PublicKey(SolanaTdpIdl.address);

const STREAM_DISCRIMINATOR = [243, 60, 164, 106, 199, 192, 110, 53];
const MILESTONE_DISCRIMINATOR = [32, 129, 16, 253, 73, 199, 39, 42];

function encodeDiscriminator(bytes: number[]): string {
  return utils.bytes.bs58.encode(Buffer.from(bytes));
}

export async function fetchStreams(
  connection: Connection,
  programId: PublicKey = PROGRAM_ID,
): Promise<{ publicKey: PublicKey; account: StreamAccount }[]> {
  const raw = await connection.getProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [
      { memcmp: { offset: 0, bytes: encodeDiscriminator(STREAM_DISCRIMINATOR) } },
      { dataSize: 187 },
    ],
  });

  return raw
    .map(({ pubkey, account }) => {
      try {
        return { publicKey: pubkey, account: decodeStreamAccount(account.data) };
      } catch {
        return null;
      }
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
}

export async function fetchMilestoneStreams(
  connection: Connection,
  programId: PublicKey = PROGRAM_ID,
): Promise<{ publicKey: PublicKey; account: MilestoneStreamAccount }[]> {
  const raw = await connection.getProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [
      { memcmp: { offset: 0, bytes: encodeDiscriminator(MILESTONE_DISCRIMINATOR) } },
      { dataSize: 196 },
    ],
  });

  return raw
    .map(({ pubkey, account }) => {
      try {
        return { publicKey: pubkey, account: decodeMilestoneStreamAccount(account.data) };
      } catch {
        return null;
      }
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
}
