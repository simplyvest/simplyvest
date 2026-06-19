import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import type { PublicKey as UmiPk, Instruction as UmiInstruction } from "@metaplex-foundation/umi";
import { publicKey, createNoopSigner } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, Keypair, TransactionInstruction } from "@solana/web3.js";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export type CreateTokenParams = {
  payer: PublicKey;
  mint: Keypair;
  decimals: number;
  amount: number | bigint;
  metadataUri: string;
  name: string;
  symbol: string;
  rpcUrl?: string;
};

function umiPubkeyToWeb3(pk: UmiPk): PublicKey {
  return new PublicKey(pk);
}

function umiInstructionToWeb3(ix: UmiInstruction): TransactionInstruction {
  return new TransactionInstruction({
    programId: umiPubkeyToWeb3(ix.programId),
    keys: ix.keys.map((k) => ({
      pubkey: umiPubkeyToWeb3(k.pubkey),
      isSigner: k.isSigner,
      isWritable: k.isWritable,
    })),
    data: Buffer.from(ix.data),
  });
}

export function createTokenInstructions(params: CreateTokenParams): TransactionInstruction[] {
  const { payer, mint, decimals, amount, metadataUri, name, symbol } = params;

  const ata = getAssociatedTokenAddressSync(
    mint.publicKey,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
    METADATA_PROGRAM_ID,
  );

  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: mint.publicKey,
    space: MINT_SIZE,
    lamports: 1_461_600,
    programId: TOKEN_PROGRAM_ID,
  });

  const initMintIx = createInitializeMintInstruction(
    mint.publicKey,
    decimals,
    payer,
    null,
    TOKEN_PROGRAM_ID,
  );

  const createAtaIx = createAssociatedTokenAccountInstruction(
    payer,
    ata,
    payer,
    mint.publicKey,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const mintToIx = createMintToInstruction(
    mint.publicKey,
    ata,
    payer,
    BigInt(amount),
    [],
    TOKEN_PROGRAM_ID,
  );

  const payerStr = payer.toBase58();
  const mintStr = mint.publicKey.toBase58();
  const metadataPdaStr = metadataPda.toBase58();

  const umi = createUmi(params.rpcUrl ?? "https://api.devnet.solana.com");

  const umiPayer = createNoopSigner(publicKey(payerStr));
  const umiMintAuthority = createNoopSigner(publicKey(payerStr));

  const builder = createMetadataAccountV3(umi, {
    metadata: publicKey(metadataPdaStr),
    mint: publicKey(mintStr),
    mintAuthority: umiMintAuthority,
    payer: umiPayer,
    updateAuthority: publicKey(payerStr),
    data: {
      name,
      symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  });

  const metadataIx = umiInstructionToWeb3(builder.getInstructions()[0]);

  return [createMintAccountIx, initMintIx, createAtaIx, mintToIx, metadataIx];
}
