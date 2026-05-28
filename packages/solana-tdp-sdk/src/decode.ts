import { BorshAccountsCoder } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";

import type { StreamAccount, MilestoneStreamAccount } from "./types/runtime";

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

const coder = new BorshAccountsCoder(SolanaTdpIdl as Idl);

export function decodeStreamAccount(data: Buffer): StreamAccount {
  const raw = coder.decode("StreamAccount", data);
  return mapToCamelCase(raw as Record<string, unknown>) as unknown as StreamAccount;
}

export function decodeMilestoneStreamAccount(data: Buffer): MilestoneStreamAccount {
  const raw = coder.decode("MilestoneStreamAccount", data);
  return mapToCamelCase(raw as Record<string, unknown>) as unknown as MilestoneStreamAccount;
}
