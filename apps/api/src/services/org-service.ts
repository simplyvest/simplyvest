import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { Db } from "../db";

import { organizations, orgMembers, users } from "../db/schema";

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
      const id = uuidv4();
      const result = await db
        .insert(organizations)
        .values({
          id,
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          createdBy: input.createdBy,
        })
        .returning();

      const org = result[0];

      // Add creator as owner
      await db.insert(orgMembers).values({
        orgId: org.id,
        userId: input.createdBy,
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
          displayName: users.displayName,
        })
        .from(orgMembers)
        .innerJoin(users, eq(orgMembers.userId, users.id))
        .where(eq(orgMembers.orgId, id));

      return { ...org, members };
    },

    async updateOrg(id: string, input: { name?: string; description?: string | null }) {
      const result = await db
        .update(organizations)
        .set(input)
        .where(eq(organizations.id, id))
        .returning();

      return result[0] ?? null;
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
      // Resolve userId - if it looks like a wallet address, find/create the user
      let userId = input.userId;
      if (!userId.startsWith("did:privy:") && !userId.startsWith("wallet:")) {
        userId = await this.findOrCreateUserByWallet(input.userId);
      }

      const result = await db
        .insert(orgMembers)
        .values({
          orgId: input.orgId,
          userId,
          role: input.role,
        })
        .onConflictDoNothing()
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
          role: orgMembers.role,
        })
        .from(orgMembers)
        .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
        .where(eq(orgMembers.userId, userId));

      return result;
    },
  };
}

export type OrgService = ReturnType<typeof createOrgService>;
