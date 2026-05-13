import * as anchor from "@coral-xyz/anchor";
import { createMint, createAccount, mintTo } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";

let initialized = false;
type TestContext = {
  provider: anchor.AnchorProvider;
  program: anchor.Program;
  mint: PublicKey;
  senderTokenAccount: PublicKey;
  recipientTokenAccount: PublicKey;
  sender: Keypair;
  recipient: Keypair;
};
let ctx: TestContext | null = null;

export async function getTestContext(): Promise<TestContext> {
  if (initialized && ctx) return ctx;

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SolanaTdp as anchor.Program;

  const sender = anchor.web3.Keypair.generate();
  const recipient = anchor.web3.Keypair.generate();

  // Fund sender for tx fees + rent (local validator: unlimited airdrop)
  const sig = await provider.connection.requestAirdrop(
    sender.publicKey,
    100_000_000_000, // 100 SOL
  );
  await provider.connection.confirmTransaction(sig);

  const mint = await createMint(
    provider.connection,
    sender,
    sender.publicKey,
    null,
    6,
  );

  const senderTokenAccount = await createAccount(
    provider.connection,
    sender,
    mint,
    sender.publicKey,
  );
  const recipientTokenAccount = await createAccount(
    provider.connection,
    sender,
    mint,
    recipient.publicKey,
  );

  await mintTo(
    provider.connection,
    sender,
    mint,
    senderTokenAccount,
    sender,
    1_000_000_000,
  );

  ctx = { provider, program, mint, senderTokenAccount, recipientTokenAccount, sender, recipient };
  initialized = true;
  return ctx;
}
