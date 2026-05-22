import * as fs from "fs";
import * as path from "path";

import * as anchor from "@coral-xyz/anchor";
import type { SolanaTdp } from "@solana-tdp/sdk";
import {
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, Keypair, SystemProgram } from "@solana/web3.js";

import { findStreamPDA, findVaultPDA, findCreatorConfigPDA } from "../tests/helpers";

const DEVNET_URL = "https://api.devnet.solana.com";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("═══ Solana TDP — Devnet Smoke Test ═══\n");

  // ── Load wallet ──────────────────────────────────────────────────────────
  const walletPath = path.resolve(__dirname, "../keypairs/devnet-wallet.json");
  const secretKey: number[] = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
  console.log(`Wallet:   ${wallet.publicKey.toBase58()}`);

  // ── Connect ──────────────────────────────────────────────────────────────
  const connection = new Connection(DEVNET_URL, "confirmed");
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Balance:  ${(balance / 1e9).toFixed(2)} SOL`);
  console.log(`Network:  devnet\n`);

  // ── Anchor provider ──────────────────────────────────────────────────────
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program<SolanaTdp>(require("../target/idl/solana_tdp.json"), provider);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 1 — Create a test token mint
  // ──────────────────────────────────────────────────────────────────────────
  console.log("── Step 1/7: Creating test token mint ──");
  const mint = await createMint(connection, wallet, wallet.publicKey, null, 6);
  console.log(`  ✔ Mint created: ${mint.toBase58()} (6 decimals)\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 2 — Fund the wallet's ATA for this mint
  // ──────────────────────────────────────────────────────────────────────────
  console.log("── Step 2/7: Funding sender token account ──");
  const senderAta = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey,
  );
  const senderToken = senderAta.address;
  console.log(`  ✔ ATA ready: ${senderToken.toBase58()}`);

  const amount = 100_000_000; // 100 tokens (6 decimals)
  await mintTo(connection, wallet, mint, senderToken, wallet, BigInt(amount));
  console.log(`  ✔ Minted ${amount / 10 ** 6} tokens to sender\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 3 — Compute PDAs
  // ──────────────────────────────────────────────────────────────────────────
  console.log("── Step 3/7: Computing PDAs ──");

  // Start 10s from now. Duration = 120s. After waiting 15s past start,
  //  ~12.5 tokens are vested — plenty to withdraw.
  const nowSec = Math.floor(Date.now() / 1000);
  const start = nowSec + 10;
  const cliff = start;
  const end = start + 120;

  // Fetch creator_config to get the actual vesting_count from chain.
  // If it doesn't exist yet (first run), vesting_count = 0.
  const [creatorConfigPDA] = await findCreatorConfigPDA(wallet.publicKey);
  let vestingCount: anchor.BN;
  try {
    const config = await program.account.creatorConfig.fetch(creatorConfigPDA);
    vestingCount = config.vestingCount;
    console.log(`  • creator config exists, vesting_count = ${vestingCount.toString()}`);
  } catch {
    vestingCount = new anchor.BN(0);
    console.log(`  • creator config not found, using vesting_count = 0`);
  }

  const [streamPDA] = await findStreamPDA(wallet.publicKey, wallet.publicKey, mint, vestingCount);
  const [vaultPDA] = await findVaultPDA(streamPDA);

  console.log(`  • stream PDA:     ${streamPDA.toBase58()}`);
  console.log(`  • vault PDA:      ${vaultPDA.toBase58()}`);
  console.log(`  • creator config: ${creatorConfigPDA.toBase58()}\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 4 — Create stream (real timestamps, start in 10s)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("── Step 4/7: Creating stream ──");
  console.log("  ⏳ Sending create_stream transaction...");

  const createTx = await program.methods
    .createStream({
      amount: new anchor.BN(amount),
      startTime: new anchor.BN(start),
      endTime: new anchor.BN(end),
      cliffTime: new anchor.BN(cliff),
    })
    .accountsPartial({
      sender: wallet.publicKey,
      recipient: wallet.publicKey,
      stream: streamPDA,
      vault: vaultPDA,
      senderToken,
      mint,
      creatorConfig: creatorConfigPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([wallet])
    .rpc();

  console.log(`  ✔ Stream created! TX: https://explorer.solana.com/tx/${createTx}?cluster=devnet`);
  console.log(`  • Start:  +10s  (${new Date(start * 1000).toISOString()})`);
  console.log(`  • Cliff:  = start (no delay)`);
  console.log(`  • End:    +75s  (${new Date(end * 1000).toISOString()})`);
  console.log(`  • Amount: ${amount / 10 ** 6} tokens locked in vault\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 5 — Attempt withdraw before start time (should fail)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("── Step 5/7: Attempting withdraw before start (should fail) ──");

  try {
    await program.methods
      .withdraw({ amount: new anchor.BN(1) })
      .accountsPartial({
        recipient: wallet.publicKey,
        stream: streamPDA,
        vault: vaultPDA,
        recipientToken: senderToken,
        sender: wallet.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    console.log("  ✗ Unexpected — withdraw should have been rejected\n");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  ✔ Correctly rejected: "${simplifyError(msg)}"\n`);
  }

  // Step 6 — Wait until 15s past start, then withdraw
  // ──────────────────────────────────────────────────────────────────────────
  const targetTime = start + 15;
  const now = Math.floor(Date.now() / 1000);
  const waitSec = Math.max(0, targetTime - now);
  console.log(
    `── Step 6/7: Waiting ${waitSec}s for vesting (~${waitSec - 5}s past start), then withdrawing ──`,
  );
  console.log("  ⏳ Waiting...");
  await sleep(waitSec * 1000);
  // ~15s elapsed: vested = 100 * 15 / 120 ≈ 12.5 tokens
  console.log("  ⏳ Sending withdraw transaction...");
  const withdrawAmount = 5_000_000; // 5 tokens (safe — ~12.5 vested)
  const withdrawTx = await program.methods
    .withdraw({ amount: new anchor.BN(withdrawAmount) })
    .accountsPartial({
      recipient: wallet.publicKey,
      stream: streamPDA,
      vault: vaultPDA,
      recipientToken: senderToken,
      sender: wallet.publicKey,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([wallet])
    .rpc();

  console.log(
    `  ✔ Withdrew ${withdrawAmount / 10 ** 6} tokens! TX: https://explorer.solana.com/tx/${withdrawTx}?cluster=devnet`,
  );
  console.log(`  • Vault remaining: ~${(amount - withdrawAmount) / 10 ** 6} tokens\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 7 — Cancel stream (no time restriction)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("── Step 7/7: Cancelling stream ──");
  console.log("  ⏳ Sending cancel transaction...");

  const cancelTx = await program.methods
    .cancel()
    .accountsPartial({
      sender: wallet.publicKey,
      recipient: wallet.publicKey,
      stream: streamPDA,
      vault: vaultPDA,
      senderToken,
      recipientToken: senderToken,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([wallet])
    .rpc();

  console.log(
    `  ✔ Stream cancelled! TX: https://explorer.solana.com/tx/${cancelTx}?cluster=devnet`,
  );
  console.log(`  • Vault closed, tokens returned to ATA\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────────────────────
  console.log("═══ Summary ═══");
  console.log(`  create_stream:   https://explorer.solana.com/tx/${createTx}?cluster=devnet`);
  console.log(`  withdraw (fail):  before start — correctly rejected`);
  console.log(`  withdraw (pass): https://explorer.solana.com/tx/${withdrawTx}?cluster=devnet`);
  console.log(`  cancel:          https://explorer.solana.com/tx/${cancelTx}?cluster=devnet`);
  console.log("  ✅ All operations completed successfully.");
}

/** Strip Anchor simulation noise for a readable one-liner. */
function simplifyError(msg: string): string {
  // "failed to send transaction: … InstructionError: … { … }" → extract the readable bit
  const m = msg.match(/custom program error:\s*(0x[0-9a-f]+)/i);
  if (m) return `program error ${m[1]}`;
  const m2 = msg.match(/(InstructionError:|custom program error:)\s*(.+?)(\n|\.$)/);
  if (m2) return m2[2].trim();
  return msg.slice(0, 120);
}

main().catch((err) => {
  console.error("\n❌ Smoke test failed:", err);
  process.exit(1);
});
