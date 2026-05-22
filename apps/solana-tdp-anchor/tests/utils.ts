import * as anchor from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createInitializeAccountInstruction,
  createMintToInstruction,
  AccountLayout,
  MintLayout,
} from "@solana/spl-token";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { fromWorkspace, LiteSVMProvider } from "anchor-litesvm";

// Fresh SVM per call to prevent memory accumulation across tests
const newSvm = () => fromWorkspace("./").withDefaultPrograms().withBuiltins().withSysvars();

export const setupTest = () => {
  const svm: any = newSvm();
  const provider = new LiteSVMProvider(svm);

  anchor.setProvider(provider as any);

  const program: any = new anchor.Program(require("../target/idl/solana_tdp.json"), provider);

  // --- SVM-based helpers ---

  const svmGetTransaction = (txSig: string) => {
    const meta = svm.getTransaction(anchor.utils.bytes.bs58.decode(txSig));
    if (!meta) return null;
    const logs = "logs" in meta ? (meta as any).logs() : (meta as any).meta().logs();
    return {
      meta: {
        logMessages: logs,
        err: "err" in meta ? (meta as any).err() : null,
      },
    };
  };

  // Monkey-patch for EventParser + parseEvents compatibility
  (provider.connection as any).getTransaction = async (sig: string) => svmGetTransaction(sig);

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

// ── SPL Token Helpers ──────────────────────────────────────────────────────
// These build manual transactions because LiteSVMConnectionProxy doesn't
// expose sendTransaction() — the @solana/spl-token convenience functions
// (createMint, createAccount, mintTo) require it via connection.

const MINT_LEN = MintLayout.span;
const ACCOUNT_LEN = AccountLayout.span;

export const createMint = async (
  provider: any,
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

  await provider.sendAndConfirm(tx, [payer, mintKp]);
  return mintKp.publicKey;
};

export const createTokenAccount = async (
  provider: any,
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

  await provider.sendAndConfirm(tx, [payer, accountKp]);
  return accountKp.publicKey;
};

export const mintTo = async (
  provider: any,
  mint: PublicKey,
  destination: PublicKey,
  authority: Keypair,
  amount: bigint,
): Promise<void> => {
  const tx = new anchor.web3.Transaction().add(
    createMintToInstruction(mint, destination, authority.publicKey, amount, [], TOKEN_PROGRAM_ID),
  );

  await provider.sendAndConfirm(tx, [authority]);
};
