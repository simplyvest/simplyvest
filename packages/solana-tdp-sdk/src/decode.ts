import { BorshAccountsCoder } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";

import type { StreamAccount, MilestoneStreamAccount, CreatorConfig } from "./types/runtime";

import SolanaTdpIdl from "./idl/solana_tdp.json";

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapToCamelCase(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    out[toCamelCase(key)] = raw[key];
  }
  return out;
}

// TODO: look into proper typing — BorshAccountsCoder expects explicit Idl type
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const coder = new BorshAccountsCoder(SolanaTdpIdl as Idl);

export function decodeStreamAccount(data: Buffer): StreamAccount {
  const raw = coder.decode("StreamAccount", data);
  // TODO: look into proper typing — Borsh decode returns any, domain type is structural
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return mapToCamelCase(raw as Record<string, unknown>) as unknown as StreamAccount;
}

export function decodeMilestoneStreamAccount(data: Buffer): MilestoneStreamAccount {
  const raw = coder.decode("MilestoneStreamAccount", data);
  // TODO: look into proper typing — same Borsh decode limitation as above
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return mapToCamelCase(raw as Record<string, unknown>) as unknown as MilestoneStreamAccount;
}

export function decodeCreatorConfig(data: Buffer): CreatorConfig {
  const raw = coder.decode("CreatorConfig", data);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return mapToCamelCase(raw as Record<string, unknown>) as unknown as CreatorConfig;
}
