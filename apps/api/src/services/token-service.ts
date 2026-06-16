import { createTokenInstructions } from "@solana-tdp/sdk";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { eq, sql } from "drizzle-orm";

import type { Db } from "../db";

import { tokenCreations, tokenPreferences, userSettings } from "../db/schema";

type CreateTokenInput = {
  mintAddress: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  metadataUri: string;
};

type SetVisibilityInput = {
  mintAddress: string;
  creatorAddress: string;
  visible: boolean;
};

export function createTokenService(db: Db) {
  return {
    async recordToken(input: CreateTokenInput) {
      const result = await db
        .insert(tokenCreations)
        .values(input)
        .onConflictDoNothing()
        .returning();
      return result[0] ?? null;
    },

    async listTokens(creatorAddress: string, filter?: "visible") {
      const prefs = db
        .select({
          mintAddress: tokenPreferences.mintAddress,
          visible: tokenPreferences.visible,
        })
        .from(tokenPreferences)
        .where(eq(tokenPreferences.creatorAddress, creatorAddress))
        .as("prefs");

      const modeRow = await db
        .select({ mode: userSettings.tokenVisibilityMode })
        .from(userSettings)
        .where(eq(userSettings.userId, creatorAddress))
        .get();

      const visibilityMode = modeRow?.mode ?? "hide_list";

      const results = await db
        .select({
          mintAddress: tokenCreations.mintAddress,
          name: tokenCreations.name,
          symbol: tokenCreations.symbol,
          decimals: tokenCreations.decimals,
          supply: tokenCreations.supply,
          metadataUri: tokenCreations.metadataUri,
          createdAt: tokenCreations.createdAt,
          created_here: sql<boolean>`1`,
          visible: prefs.visible,
        })
        .from(tokenCreations)
        .leftJoin(prefs, eq(tokenCreations.mintAddress, prefs.mintAddress))
        .where(eq(tokenCreations.creatorAddress, creatorAddress))
        .all();

      if (filter === "visible") {
        if (visibilityMode === "hide_list") {
          return results.filter((r) => r.visible !== false);
        }
        return results.filter((r) => r.visible === true);
      }

      return results;
    },

    async setVisibility(input: SetVisibilityInput) {
      await db
        .insert(tokenPreferences)
        .values({
          mintAddress: input.mintAddress,
          creatorAddress: input.creatorAddress,
          visible: input.visible,
          hiddenAt: input.visible ? null : new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: [tokenPreferences.mintAddress, tokenPreferences.creatorAddress],
          set: {
            visible: input.visible,
            hiddenAt: input.visible ? null : new Date().toISOString(),
          },
        });
    },

    async getPreferences(creatorAddress: string) {
      const [settingsRow, prefRows] = await Promise.all([
        db
          .select({ tokenVisibilityMode: userSettings.tokenVisibilityMode })
          .from(userSettings)
          .where(eq(userSettings.userId, creatorAddress))
          .get(),
        db
          .select({
            mintAddress: tokenPreferences.mintAddress,
            visible: tokenPreferences.visible,
          })
          .from(tokenPreferences)
          .where(eq(tokenPreferences.creatorAddress, creatorAddress))
          .all(),
      ]);

      return {
        tokenVisibilityMode: settingsRow?.tokenVisibilityMode ?? "hide_list",
        preferences: prefRows,
      };
    },
  };
}

export async function uploadMetadataJson(
  name: string,
  symbol: string,
  imageUrl: string | undefined,
  bucket: R2Bucket,
  baseUrl: string,
): Promise<string> {
  const metadata: { name: string; symbol: string; image?: string } = { name, symbol };
  if (imageUrl) {
    metadata.image = imageUrl;
  }
  const key = `tokens/${crypto.randomUUID()}.json`;
  await bucket.put(key, JSON.stringify(metadata), {
    httpMetadata: { contentType: "application/json" },
  });
  return new URL(`/api/tokens/r2/${key}`, baseUrl).toString();
}

export type PlatformTokenResult = {
  mintAddress: string;
  txSignature: string;
  name: string;
  symbol: string;
  supply: string;
};

export async function createPlatformToken(params: {
  secretKeyJson: string | undefined;
  rpcUrl: string;
  name: string;
  symbol: string;
  decimals: number;
  amount: string;
  creatorAddress: string;
  metadataUri: string;
}): Promise<PlatformTokenResult> {
  if (!params.secretKeyJson) {
    throw new Error("PLATFORM_SECRET_KEY not configured");
  }

  const parsed = JSON.parse(params.secretKeyJson);
  if (!Array.isArray(parsed) || !parsed.every((v: unknown) => typeof v === "number")) {
    throw new Error("PLATFORM_SECRET_KEY is not a valid keypair byte array");
  }
  const secretKey = new Uint8Array(parsed);
  const platformWallet = Keypair.fromSecretKey(secretKey);

  const connection = new Connection(params.rpcUrl, "confirmed");
  const mint = Keypair.generate();
  const [whole, frac = ""] = params.amount.split(".");
  const supply = whole + frac.padEnd(params.decimals, "0").slice(0, params.decimals);
  const creatorPk = new PublicKey(params.creatorAddress);

  const instructions = createTokenInstructions({
    payer: platformWallet.publicKey,
    mint,
    decimals: params.decimals,
    amount: BigInt(supply),
    metadataUri: params.metadataUri,
    name: params.name,
    symbol: params.symbol,
  });

  const creatorAta = getAssociatedTokenAddressSync(mint.publicKey, creatorPk);
  instructions.push(
    createAssociatedTokenAccountInstruction(
      platformWallet.publicKey,
      creatorAta,
      creatorPk,
      mint.publicKey,
    ),
    createTransferInstruction(
      getAssociatedTokenAddressSync(mint.publicKey, platformWallet.publicKey),
      creatorAta,
      platformWallet.publicKey,
      BigInt(supply),
    ),
  );

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = platformWallet.publicKey;
  tx.add(...instructions);
  tx.sign(platformWallet, mint);

  const txSignature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
    maxRetries: 5,
  });

  const startTime = Date.now();
  // oxlint-disable-next-line eslint/no-await-in-loop
  while (Date.now() - startTime < 30_000) {
    // oxlint-disable-next-line eslint/no-await-in-loop
    const status = await connection.getSignatureStatus(txSignature);
    if (
      status?.value?.confirmationStatus === "confirmed" ||
      status?.value?.confirmationStatus === "finalized"
    ) {
      break;
    }
    if (status?.value?.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
    }
    // oxlint-disable-next-line eslint/no-await-in-loop
    await new Promise((r) => setTimeout(r, 2000));
  }

  return {
    mintAddress: mint.publicKey.toBase58(),
    txSignature,
    name: params.name,
    symbol: params.symbol,
    supply,
  };
}
