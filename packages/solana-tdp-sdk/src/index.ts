export * from "./constants";
export * from "./pda";
export * from "./events";
export * from "./accounts";
export * from "./vesting";
export * from "./decode";
export * from "./fetch";
export * from "./metadata";
export * from "./types/runtime";
export * from "./types/solana_tdp";
import type { SolanaTdp } from "./types/solana_tdp";

import SolanaTdpIdl from "./idl/solana_tdp.json";

export { SolanaTdpIdl };
// The typed IDL cast is unavoidable: Anchor's Program<SolanaTdp> requires the
// generated type, but TypeScript can't infer it from the JSON import alone.
// This central export keeps the single safe-assertion in one place.
// TODO: look into proper typing — Anchor codegen improvements may eliminate this
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
export const SOLANA_TDP_PROGRAM_IDL = SolanaTdpIdl as unknown as SolanaTdp;
