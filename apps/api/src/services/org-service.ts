import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { Db } from "../db";

import { organizations, orgMembers, users, tokenCreations } from "../db/schema";

export interface CreateOrgInput {
  name: string;
  slug: string;
  description?: string;
  createdBy: string;
}

export interface AddMemberInput {
  orgId: string;
  userId: string;
  role: "owner" | "admin" | "member";
}

export function createOrgService(db: Db) {
  return {
    async createOrg(input: CreateOrgInput) {
      // Ensure the creator user exists (handles Privy DIDs and wallet addresses)
      let createdBy = input.createdBy;
      if (createdBy.startsWith("did:privy:")) {
        createdBy = await this.findOrCreateUserByPrivyId(createdBy);
      } else if (!createdBy.startsWith("wallet:")) {
        createdBy = await this.findOrCreateUserByWallet(createdBy);
      }

      const id = uuidv4();
      const result = await db
        .insert(organizations)
        .values({
          id,
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          createdBy,
        })
        .returning();

      const org = result[0];

      // Add creator as owner
      await db.insert(orgMembers).values({
        orgId: org.id,
        userId: createdBy,
        role: "owner",
      });

      return org;
    },

    async getOrgById(id: string) {
      const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
      return result[0] ?? null;
    },

    async getOrgBySlug(slug: string) {
      const result = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1);
      return result[0] ?? null;
    },

    async getOrgWithMembers(id: string) {
      const org = await this.getOrgById(id);
      if (!org) return null;

      const members = await db
        .select({
          userId: orgMembers.userId,
          role: orgMembers.role,
          joinedAt: orgMembers.joinedAt,
          walletAddress: users.walletAddress,
          privyId: users.privyId,
          displayName: users.displayName,
        })
        .from(orgMembers)
        .innerJoin(users, eq(orgMembers.userId, users.id))
        .where(eq(orgMembers.orgId, id));

      let tokenSupply: string | null = null;
      if (org.mintAddress) {
        const tokenRecord = await db
          .select({ supply: tokenCreations.supply })
          .from(tokenCreations)
          .where(eq(tokenCreations.mintAddress, org.mintAddress))
          .limit(1);
        tokenSupply = tokenRecord[0]?.supply ?? null;
      }

      return { ...org, members, tokenSupply };
    },

    async updateOrg(id: string, input: { name?: string; description?: string | null }) {
      const result = await db
        .update(organizations)
        .set(input)
        .where(eq(organizations.id, id))
        .returning();

      return result[0] ?? null;
    },

    async findOrCreateUserByPrivyId(privyId: string): Promise<string> {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, privyId))
        .limit(1);

      if (existing[0]) {
        return existing[0].id;
      }

      await db
        .insert(users)
        .values({
          id: privyId,
          walletAddress: privyId,
        })
        .onConflictDoNothing();

      return privyId;
    },

    async findOrCreateUserByWallet(walletAddress: string): Promise<string> {
      // Look up existing user by wallet address
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.walletAddress, walletAddress))
        .limit(1);

      if (existing[0]) {
        return existing[0].id;
      }

      // Create a placeholder user for this wallet
      const id = `wallet:${walletAddress}`;
      await db
        .insert(users)
        .values({
          id,
          walletAddress,
        })
        .onConflictDoNothing();

      return id;
    },

    async addMember(input: AddMemberInput) {
      // Resolve userId - find or create the user record
      let userId = input.userId;
      if (userId.startsWith("did:privy:")) {
        userId = await this.findOrCreateUserByPrivyId(userId);
      } else if (!userId.startsWith("wallet:")) {
        userId = await this.findOrCreateUserByWallet(userId);
      }

      // Check if already a member
      const existing = await db
        .select({ orgId: orgMembers.orgId })
        .from(orgMembers)
        .where(and(eq(orgMembers.orgId, input.orgId), eq(orgMembers.userId, userId)))
        .limit(1);

      if (existing[0]) {
        return null;
      }

      const result = await db
        .insert(orgMembers)
        .values({
          orgId: input.orgId,
          userId,
          role: input.role,
        })
        .returning();

      return result[0] ?? null;
    },

    async removeMember(orgId: string, userId: string) {
      await db
        .delete(orgMembers)
        .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)));
    },

    async getMemberRole(orgId: string, userId: string) {
      const result = await db
        .select({ role: orgMembers.role })
        .from(orgMembers)
        .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)))
        .limit(1);

      return result[0]?.role ?? null;
    },

    async listUserOrgs(userId: string) {
      const result = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          description: organizations.description,
          createdAt: organizations.createdAt,
          mintAddress: organizations.mintAddress,
          tokenName: organizations.tokenName,
          tokenSymbol: organizations.tokenSymbol,
          tokenDecimals: organizations.tokenDecimals,
          role: orgMembers.role,
        })
        .from(orgMembers)
        .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
        .where(eq(orgMembers.userId, userId));

      return result;
    },

    async setOrgToken(
      orgId: string,
      token: {
        mintAddress: string;
        tokenName: string | null;
        tokenSymbol: string | null;
        tokenDecimals: number;
      },
    ) {
      const result = await db
        .update(organizations)
        .set({
          mintAddress: token.mintAddress,
          tokenName: token.tokenName,
          tokenSymbol: token.tokenSymbol,
          tokenDecimals: token.tokenDecimals,
        })
        .where(eq(organizations.id, orgId))
        .returning();

      return result[0] ?? null;
    },

    async removeOrgToken(orgId: string) {
      const result = await db
        .update(organizations)
        .set({
          mintAddress: null,
          tokenName: null,
          tokenSymbol: null,
          tokenDecimals: null,
        })
        .where(eq(organizations.id, orgId))
        .returning();

      return result[0] ?? null;
    },

    async deleteOrg(orgId: string) {
      // Delete member associations first
      await db.delete(orgMembers).where(eq(orgMembers.orgId, orgId));
      // Then delete the organization itself
      await db.delete(organizations).where(eq(organizations.id, orgId));
    },
  };
}

export type OrgService = ReturnType<typeof createOrgService>;
