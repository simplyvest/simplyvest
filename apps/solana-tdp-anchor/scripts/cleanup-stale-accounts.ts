import * as fs from "fs";
import * as path from "path";

import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { SolanaTdpIdl, getStreamPda, getVaultPda, getCreatorConfigPda, PROGRAM_ID } from "@solana-tdp/sdk";
import type { SolanaTdp } from "@solana-tdp/sdk";

// Stale account from a previous program deployment — 178 bytes instead of 187.
const STALE_STREAM = new PublicKey("Au3RYWpESySc5ZyzWEUjd6csmdcrkXSCeCPAxJvozjVj");

async function main() {
  const walletPath = path.resolve(__dirname, "../keypairs/devnet-wallet.json");
  const secretKey: number[] = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
    commitment: "confirmed",
  });
  const program = new anchor.Program<SolanaTdp>(SolanaTdpIdl as SolanaTdp, provider);

  // Check if the stale account still exists
  const staleInfo = await connection.getAccountInfo(STALE_STREAM);
  if (!staleInfo) {
    console.log("Stale account already closed or does not exist.");
    return;
  }

  console.log("Stale account data length:", staleInfo.data.length, "bytes");
  console.log("Expected StreamAccount:", 187, "bytes");

  if (staleInfo.data.length === 187) {
    console.log("Account is now the correct size — no cleanup needed.");
    return;
  }

  // The account is stale — we need to close it.
  // Since it was created by the program but has no valid structure,
  // we'll close it by transferring rent lamports back to the creator.
  //
  // However, without valid account data we can't know the creator.
  // The simplest approach: use the devnet wallet as payer to close.
  //
  // Actually, we can't close a program-owned account without the program's
  // authority (PDA signing). The proper way is to use the program's
  // cancel instruction. But we don't know the stream's parameters
  // since the account data is unparseable.
  //
  // For devnet cleanup, we'll use the admin cli:
  console.log("\nTo close the stale account, run:");
  console.log(`solana close --address ${STALE_STREAM.toBase58()} --keypair keypairs/devnet-wallet.json --url devnet`);
  console.log("\nOr if you want the program to handle it via cancel:");
  console.log("The account is too short to decode, so cancel won't work either.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
