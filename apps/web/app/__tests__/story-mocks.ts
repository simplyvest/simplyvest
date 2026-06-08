/** Shared story mock utilities for Solana-dependent components. */

import type { StreamAccount, MilestoneStreamAccount } from "@solana-tdp/sdk";
import type BN from "bn.js";

// -- Internal cast helpers (single place for all type assertions) --

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const asBN = (mock: { toNumber: () => number }) => mock as unknown as BN;

// -- Public mock factories --

export function createMockPublicKey(base58: string) {
  return {
    toBase58: () => base58,
    equals: (other: { toBase58?: () => string }) => other?.toBase58?.() === base58,
  };
}

export function createMockBN(n: number) {
  return {
    toNumber: () => n,
    valueOf: () => n,
    sub: (other: { toNumber?: () => number }) => createMockBN(n - (other?.toNumber?.() ?? 0)),
    gt: (other: { toNumber?: () => number }) => n > (other?.toNumber?.() ?? 0),
    gte: (other: { toNumber?: () => number }) => n >= (other?.toNumber?.() ?? 0),
    lt: (other: { toNumber?: () => number }) => n < (other?.toNumber?.() ?? 0),
    lte: (other: { toNumber?: () => number }) => n <= (other?.toNumber?.() ?? 0),
    mul: (other: { toNumber?: () => number }) => createMockBN(n * (other?.toNumber?.() ?? 0)),
    div: (other: { toNumber?: () => number }) =>
      createMockBN(Math.floor(n / (other?.toNumber?.() ?? 1))),
    muln: (scalar: number) => createMockBN(n * scalar),
    toString: () => n.toString(),
    eq: (other: { toNumber?: () => number }) => n === (other?.toNumber?.() ?? 0),
  };
}

/**
 * Returns a mock PublicKey. Typed as `any` to avoid cross-package PublicKey
 * type mismatches between @solana/web3.js instances in monorepo.
 */
// oxlint-disable-next-line typescript/no-unsafe-type-assertion, typescript/no-explicit-any
export function mockPK(base58: string): any {
  return createMockPublicKey(base58);
}

/** Returns a mock BN typed as the SDK BN class. */
export function mockBN(n: number): BN {
  return asBN(createMockBN(n));
}

/** Create a typed mock StreamAccount. */
export function createMockStreamAccount(overrides?: {
  creator?: ReturnType<typeof mockPK>;
  recipient?: ReturnType<typeof mockPK>;
  mint?: ReturnType<typeof mockPK>;
  vault?: ReturnType<typeof mockPK>;
  amount?: BN;
  amountWithdrawn?: BN;
  startTime?: BN;
  cliffTime?: BN;
  endTime?: BN;
  vestingCount?: BN;
  cancelled?: boolean;
  bump?: number;
  vaultBump?: number;
}): StreamAccount {
  return {
    creator: overrides?.creator ?? mockPK("11111111111111111111111111111111"),
    recipient: overrides?.recipient ?? mockPK("22222222222222222222222222222222"),
    mint: overrides?.mint ?? mockPK("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    vault: overrides?.vault ?? mockPK("33333333333333333333333333333333"),
    amount: overrides?.amount ?? mockBN(1_000_000_000_000),
    amountWithdrawn: overrides?.amountWithdrawn ?? mockBN(250_000_000_000),
    startTime: overrides?.startTime ?? mockBN(1_700_000_000),
    cliffTime: overrides?.cliffTime ?? mockBN(1_700_000_000),
    endTime: overrides?.endTime ?? mockBN(1_800_000_000),
    vestingCount: overrides?.vestingCount ?? mockBN(0),
    cancelled: overrides?.cancelled ?? false,
    bump: overrides?.bump ?? 255,
    vaultBump: overrides?.vaultBump ?? 255,
  };
}

/** Create a typed mock MilestoneStreamAccount. */
export function createMockMilestoneStreamAccount(overrides?: {
  creator?: ReturnType<typeof mockPK>;
  recipient?: ReturnType<typeof mockPK>;
  mint?: ReturnType<typeof mockPK>;
  vault?: ReturnType<typeof mockPK>;
  amount?: BN;
  amountWithdrawn?: BN;
  milestoneAuthority?: ReturnType<typeof mockPK>;
  milestoneReached?: boolean;
  cancelled?: boolean;
  vestingCount?: BN;
  bump?: number;
  vaultBump?: number;
}): MilestoneStreamAccount {
  return {
    creator: overrides?.creator ?? mockPK("11111111111111111111111111111111"),
    recipient: overrides?.recipient ?? mockPK("22222222222222222222222222222222"),
    mint: overrides?.mint ?? mockPK("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    vault: overrides?.vault ?? mockPK("33333333333333333333333333333333"),
    amount: overrides?.amount ?? mockBN(1_000_000_000_000),
    amountWithdrawn: overrides?.amountWithdrawn ?? mockBN(0),
    milestoneAuthority: overrides?.milestoneAuthority ?? mockPK("44444444444444444444444444444444"),
    milestoneReached: overrides?.milestoneReached ?? false,
    cancelled: overrides?.cancelled ?? false,
    vestingCount: overrides?.vestingCount ?? mockBN(0),
    bump: overrides?.bump ?? 255,
    vaultBump: overrides?.vaultBump ?? 255,
  };
}

/** Mock return value of useAuth() — connected with a mock public key. */
export function createMockUseAuth(pk = "11111111111111111111111111111111") {
  return {
    connected: true,
    connecting: false,
    publicKey: createMockPublicKey(pk),
    user: null,
  };
}

/**
 * Returns a class constructor that mocks @solana/web3.js's PublicKey.
 * Use inside vi.mock factories:
 *   vi.mock("@solana/web3.js", () => ({ PublicKey: createPublicKeyClass() }))
 */
export function createPublicKeyClass() {
  return class MockPublicKey {
    value: string;

    constructor(value: string) {
      this.value = value;
    }

    toBase58() {
      return this.value;
    }
  };
}

/**
 * Create a mock token info object for story/test use.
 * Matches the TokenInfo interface from use-owned-tokens.
 */
export function createMockTokenInfo(overrides?: {
  mint?: string;
  balance?: bigint;
  address?: string;
  meta?: { name: string; symbol: string } | null;
}) {
  return {
    mint: mockPK(overrides?.mint ?? "11111111111111111111111111111111"),
    balance: overrides?.balance ?? 100_000_000n,
    address: mockPK(overrides?.address ?? "22222222222222222222222222222222"),
    meta: overrides?.meta ?? null,
  };
}
