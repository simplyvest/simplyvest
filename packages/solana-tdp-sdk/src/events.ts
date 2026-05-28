import * as anchor from "@coral-xyz/anchor";
import { EventParser, Provider } from "@coral-xyz/anchor";

import type { SolanaTdp } from "./types/solana_tdp";

export const parseEvents = async (
  provider: Provider,
  program: anchor.Program<SolanaTdp>,
  txSig: string,
): Promise<anchor.Event[]> => {
  const tx = await provider.connection.getTransaction(txSig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  const logs = tx?.meta?.logMessages ?? [];
  const parser = new EventParser(program.programId, program.coder);
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
