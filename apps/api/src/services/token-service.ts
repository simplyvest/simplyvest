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
      const row = await db
        .select({ tokenVisibilityMode: userSettings.tokenVisibilityMode })
        .from(userSettings)
        .where(eq(userSettings.userId, creatorAddress))
        .get();

      return {
        tokenVisibilityMode: row?.tokenVisibilityMode ?? "hide_list",
      };
    },
  };
}
