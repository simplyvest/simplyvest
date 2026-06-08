import { eq } from "drizzle-orm";

import type { Db } from "../db";

import { users } from "../db/schema";

export interface CreateUserInput {
  id: string;
  walletAddress: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  avatarUrl?: string;
  email?: string;
}

export function createUserService(db: Db) {
  return {
    async createUser(input: CreateUserInput) {
      const result = await db
        .insert(users)
        .values({
          id: input.id,
          walletAddress: input.walletAddress,
          displayName: input.displayName ?? null,
          avatarUrl: input.avatarUrl ?? null,
          email: input.email ?? null,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            walletAddress: input.walletAddress,
            displayName: input.displayName ?? undefined,
            avatarUrl: input.avatarUrl ?? undefined,
            email: input.email ?? undefined,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result[0];
    },

    async getUserById(id: string) {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] ?? null;
    },

    async getUserByWallet(walletAddress: string) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.walletAddress, walletAddress))
        .limit(1);
      return result[0] ?? null;
    },

    async updateUser(id: string, input: UpdateUserInput) {
      const result = await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      return result[0] ?? null;
    },

    async upsertUser(input: CreateUserInput) {
      const existing = await this.getUserById(input.id);
      if (existing) {
        return this.updateUser(input.id, {
          displayName: input.displayName,
          avatarUrl: input.avatarUrl,
          email: input.email,
        });
      }
      return this.createUser(input);
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
