import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk");

export const findStreamPDA = (
  creator: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  vestingCount: anchor.BN,
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from("stream"),
      creator.toBuffer(),
      recipient.toBuffer(),
      mint.toBuffer(),
      vestingCount.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID,
  );
};

export const findVaultPDA = (stream: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress([Buffer.from("vault"), stream.toBuffer()], PROGRAM_ID);
};

export const findCreatorConfigPDA = (creator: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from("creator_config"), creator.toBuffer()],
    PROGRAM_ID,
  );
};

export const findMilestoneStreamPDA = (
  creator: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  vestingCount: anchor.BN,
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from("milestone-stream"),
      creator.toBuffer(),
      recipient.toBuffer(),
      mint.toBuffer(),
      vestingCount.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID,
  );
};

export const now = () => Math.floor(Date.now() / 1000);

// ── Event Parsing ───────────────────────────────────────────────────────────

export const parseEvents = async (
  provider: anchor.Provider,
  program: { programId: PublicKey; coder: anchor.Coder },
  txSig: string,
): Promise<anchor.Event[]> => {
  const tx = await provider.connection.getTransaction(txSig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  const logs = tx?.meta?.logMessages ?? [];
  const parser = new anchor.EventParser(program.programId, program.coder);
  const events: anchor.Event[] = [];
  for (const event of parser.parseLogs(logs)) {
    events.push(event);
  }
  return events;
};

export const findEvent = (events: anchor.Event[], name: string): anchor.Event => {
  const event = events.find((e) => e?.name === name);
  if (!event) {
    throw new Error(
      `Expected event "${name}" not found in transaction logs.\nEmitted events: [${
        events.map((e) => e.name).join(", ") || "none"
      }]`,
    );
  }
  return event;
};
