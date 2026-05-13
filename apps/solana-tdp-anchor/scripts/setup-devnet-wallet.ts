import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { Keypair } from "@solana/web3.js";

const KEYPAIR_PATH = path.resolve(__dirname, "../keypairs/devnet-wallet.json");

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("=== Solana Devnet Wallet Setup ===\n");
  console.log("Paste your secret key as a JSON array of 64 numbers.");
  console.log("(This is the format exported by 'solana-keygen export --outfile keypair.json')\n");

  const raw = await prompt("Secret key array: ");

  let secretKey: Uint8Array;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 64) {
      throw new Error("Secret key must be an array of 64 numbers.");
    }
    secretKey = new Uint8Array(parsed);
  } catch {
    console.error("Error: Invalid secret key array. Must be 64 numbers.");
    process.exit(1);
  }

  const keypair = Keypair.fromSecretKey(secretKey);

  const dir = path.dirname(KEYPAIR_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(secretKey)));

  console.log(`\nKeypair saved to ${KEYPAIR_PATH}`);
  console.log(`Public key: ${keypair.publicKey.toBase58()}`);
  console.log("\nDone! You can now run: pnpm build && pnpm deploy");
}

main().catch(console.error);
