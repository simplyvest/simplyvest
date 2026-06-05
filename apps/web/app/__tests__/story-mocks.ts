/** Shared story mock utilities for Solana-dependent components. */

/**
 * Create a mock PublicKey-like object with toBase58() and equals().
 * Used wherever a component expects a PublicKey instance.
 */
export function createMockPublicKey(base58: string) {
  return {
    toBase58: () => base58,
    equals: (other: { toBase58?: () => string }) => other?.toBase58?.() === base58,
  };
}

/**
 * Create a mock BN-like object with toNumber(), valueOf(), and sub().
 * Used wherever a component expects a BN instance for time/amount calculations.
 */
export function createMockBN(n: number) {
  return {
    toNumber: () => n,
    valueOf: () => n,
    sub: (other: { toNumber?: () => number }) => createMockBN(n - (other?.toNumber?.() ?? 0)),
  };
}

/** Mock return value of useWallet() — connected with a mock public key. */
export function createMockUseWallet(pk = "11111111111111111111111111111111") {
  return {
    connected: true,
    publicKey: createMockPublicKey(pk),
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
