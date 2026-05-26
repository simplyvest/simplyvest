export * from "./pda";
export * from "./events";
export * from "./accounts";
export * from "./vesting";
export * from "./types/runtime";
export * from "./types/solana_tdp";

import { PublicKey } from "@solana/web3.js";

import SolanaTdpIdl from "./idl/solana_tdp.json";

export { SolanaTdpIdl };

export const PROGRAM_ID = new PublicKey(SolanaTdpIdl.address);
