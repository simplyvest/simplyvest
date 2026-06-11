import * as path from "path";

import * as anchor from "@coral-xyz/anchor";
import type { SolanaTdp } from "@solana-tdp/sdk";
import { SOLANA_TDP_PROGRAM_IDL } from "@solana-tdp/sdk";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createInitializeAccountInstruction,
  createMintToInstruction,
  AccountLayout,
  MintLayout,
} from "@solana/spl-token";
import {
  ConfirmOptions,
  Connection,
  PublicKey,
  Keypair,
  Signer,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { LiteSVMProvider } from "anchor-litesvm";
import { LiteSVM } from "litesvm";

interface ProviderSend {
  connection: Connection;
  sendAndConfirm?(
    tx: Transaction | VersionedTransaction,
    signers?: Signer[],
    _opts?: ConfirmOptions,
  ): Promise<string>;
}

// Fresh SVM per call to prevent memory accumulation across tests
const newSvm = () => {
  const soPath = path.resolve(import.meta.dirname, "../target/deploy/solana_tdp.so");
  const svm = new LiteSVM().withSysvars().withBuiltins().withDefaultPrograms();
  svm.addProgramFromFile(new PublicKey("6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk"), soPath);
  return svm;
};

export const setupTest = () => {
  const svm = newSvm();
  const provider = new LiteSVMProvider(svm);

  anchor.setProvider(provider);

  const program = new anchor.Program<SolanaTdp>(SOLANA_TDP_PROGRAM_IDL, provider);

  const svmAirdrop = (addresses: PublicKey[]) => {
    for (const address of addresses) {
      svm.airdrop(address, BigInt(10 * 1_000_000_000));
    }
  };

  const warp = (seconds: number) => {
    const clock = svm.getClock();
    clock.slot += BigInt(Math.ceil(seconds / 0.4));
    clock.unixTimestamp += BigInt(seconds);
    svm.setClock(clock);
  };

  const svmTokenBalance = (pk: PublicKey): bigint => {
    const account = svm.getAccount(pk);
    if (!account) return BigInt(0);
    const data = Buffer.from(account.data);
    // SPL Token account: amount at offset 64, 8 bytes little-endian
    return data.readBigUInt64LE(64);
  };

  return { svm, provider, program, svmAirdrop, warp, svmTokenBalance };
};

export type SetupTest = ReturnType<typeof setupTest>;

/**
 * Parse Anchor events from a transaction using the SVM instance directly.
 * Use this in tests instead of the SDK's `parseEvents` (which requires
 * `provider.connection.getTransaction` — not available on LiteSVM).
 */
export const svmParseEvents = async (
  svm: SetupTest["svm"],
  program: anchor.Program<SolanaTdp>,
  txSig: string,
): Promise<anchor.Event[]> => {
  const meta = svm.getTransaction(anchor.utils.bytes.bs58.decode(txSig));
  if (!meta) return [];
  const txMeta = "logs" in meta ? meta : meta.meta();
  const logs = txMeta.logs();
  const parser = new anchor.EventParser(program.programId, program.coder);
  const events: anchor.Event[] = [];
  for (const event of parser.parseLogs(logs)) {
    events.push(event);
  }
  return events;
};

// ── SPL Token Helpers ──────────────────────────────────────────────────────
// These build manual transactions because LiteSVMConnectionProxy doesn't
// expose sendTransaction() — the @solana/spl-token convenience functions
// (createMint, createAccount, mintTo) require it via connection.

const MINT_LEN = MintLayout.span;
const ACCOUNT_LEN = AccountLayout.span;

export const createMint = async (
  provider: ProviderSend,
  payer: Keypair,
  mintAuthority: PublicKey,
  decimals: number,
): Promise<PublicKey> => {
  const mintKp = Keypair.generate();
  const lamports = await provider.connection.getMinimumBalanceForRentExemption(MINT_LEN);

  const tx = new anchor.web3.Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKp.publicKey,
      space: MINT_LEN,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKp.publicKey,
      decimals,
      mintAuthority,
      null, // freezeAuthority
      TOKEN_PROGRAM_ID,
    ),
  );

  if (!provider.sendAndConfirm) throw new Error("sendAndConfirm not available");
  await provider.sendAndConfirm(tx, [payer, mintKp]);
  return mintKp.publicKey;
};

export const createTokenAccount = async (
  provider: ProviderSend,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
): Promise<PublicKey> => {
  const accountKp = Keypair.generate();
  const lamports = await provider.connection.getMinimumBalanceForRentExemption(ACCOUNT_LEN);

  const tx = new anchor.web3.Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: accountKp.publicKey,
      space: ACCOUNT_LEN,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeAccountInstruction(accountKp.publicKey, mint, owner, TOKEN_PROGRAM_ID),
  );

  if (!provider.sendAndConfirm) throw new Error("sendAndConfirm not available");
  await provider.sendAndConfirm(tx, [payer, accountKp]);
  return accountKp.publicKey;
};

export const mintTo = async (
  provider: ProviderSend,
  mint: PublicKey,
  destination: PublicKey,
  authority: Keypair,
  amount: bigint,
): Promise<void> => {
  const tx = new anchor.web3.Transaction().add(
    createMintToInstruction(mint, destination, authority.publicKey, amount, [], TOKEN_PROGRAM_ID),
  );

  if (!provider.sendAndConfirm) throw new Error("sendAndConfirm not available");
  await provider.sendAndConfirm(tx, [authority]);
};
