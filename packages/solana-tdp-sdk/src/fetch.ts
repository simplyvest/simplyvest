import { utils } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";

import type { StreamAccount, MilestoneStreamAccount } from "./types/runtime";

import { PROGRAM_ID, DISCRIMINATORS, ACCOUNT_SIZES } from "./constants";
import { decodeStreamAccount, decodeMilestoneStreamAccount } from "./decode";

function encodeDiscriminator(bytes: readonly number[]): string {
  return utils.bytes.bs58.encode(Buffer.from(bytes));
}

export async function fetchStreams(
  connection: Connection,
  programId: PublicKey = PROGRAM_ID,
): Promise<{ publicKey: PublicKey; account: StreamAccount }[]> {
  const raw = await connection.getProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [
      { memcmp: { offset: 0, bytes: encodeDiscriminator(DISCRIMINATORS.StreamAccount) } },
      { dataSize: ACCOUNT_SIZES.StreamAccount },
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

export async function fetchStreamsByCreator(
  connection: Connection,
  creator: PublicKey,
  programId: PublicKey = PROGRAM_ID,
): Promise<{ publicKey: PublicKey; account: StreamAccount }[]> {
  const raw = await connection.getProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [
      { memcmp: { offset: 0, bytes: encodeDiscriminator(DISCRIMINATORS.StreamAccount) } },
      { dataSize: ACCOUNT_SIZES.StreamAccount },
      { memcmp: { offset: 8, bytes: creator.toBase58() } },
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

export async function fetchStreamsByRecipient(
  connection: Connection,
  recipient: PublicKey,
  programId: PublicKey = PROGRAM_ID,
): Promise<{ publicKey: PublicKey; account: StreamAccount }[]> {
  const raw = await connection.getProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [
      { memcmp: { offset: 0, bytes: encodeDiscriminator(DISCRIMINATORS.StreamAccount) } },
      { dataSize: ACCOUNT_SIZES.StreamAccount },
      { memcmp: { offset: 40, bytes: recipient.toBase58() } },
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
      { memcmp: { offset: 0, bytes: encodeDiscriminator(DISCRIMINATORS.MilestoneStreamAccount) } },
      { dataSize: ACCOUNT_SIZES.MilestoneStreamAccount },
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

export async function fetchMilestoneStreamsByCreator(
  connection: Connection,
  creator: PublicKey,
  programId: PublicKey = PROGRAM_ID,
): Promise<{ publicKey: PublicKey; account: MilestoneStreamAccount }[]> {
  const raw = await connection.getProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [
      { memcmp: { offset: 0, bytes: encodeDiscriminator(DISCRIMINATORS.MilestoneStreamAccount) } },
      { dataSize: ACCOUNT_SIZES.MilestoneStreamAccount },
      { memcmp: { offset: 8, bytes: creator.toBase58() } },
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

export async function fetchMilestoneStreamsByRecipient(
  connection: Connection,
  recipient: PublicKey,
  programId: PublicKey = PROGRAM_ID,
): Promise<{ publicKey: PublicKey; account: MilestoneStreamAccount }[]> {
  const raw = await connection.getProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [
      { memcmp: { offset: 0, bytes: encodeDiscriminator(DISCRIMINATORS.MilestoneStreamAccount) } },
      { dataSize: ACCOUNT_SIZES.MilestoneStreamAccount },
      { memcmp: { offset: 40, bytes: recipient.toBase58() } },
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
