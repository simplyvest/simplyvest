import { Hono } from "hono";

import type { Env } from "../../env";

import { createDb } from "../db";
import { authMiddleware, getUserId } from "../middleware/auth";
import { createOrgService } from "../services/org-service";
import {
  createTokenService,
  createPlatformToken,
  uploadMetadataJson,
} from "../services/token-service";

export const orgRoutes = new Hono<{ Bindings: Env }>();

// Create organization (requires auth)
orgRoutes.post("/", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  if (!body.name || !body.slug) {
    return c.json({ error: "name and slug are required" }, 400);
  }

  // Check slug uniqueness
  const existing = await service.getOrgBySlug(body.slug);
  if (existing) {
    return c.json({ error: "Slug already taken" }, 409);
  }

  const org = await service.createOrg({
    name: body.name,
    slug: body.slug,
    description: body.description,
    createdBy: userId,
  });

  return c.json(org, 201);
});

// Get organization by ID (public)
orgRoutes.get("/:id", async (c) => {
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const org = await service.getOrgWithMembers(orgId);
  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }

  return c.json(org);
});

// Update organization (requires auth + admin/owner role)
orgRoutes.put("/:id", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, userId);
  if (!role || role === "member") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const updateInput: { name?: string; description?: string | null } = {};
  if (body.name !== undefined) updateInput.name = body.name;
  if (body.description !== undefined) updateInput.description = body.description;

  const org = await service.updateOrg(orgId, updateInput);
  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }

  return c.json(org);
});

// Add member to organization (requires auth + admin/owner role)
orgRoutes.post("/:id/members", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, userId);
  if (!role || role === "member") {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (!body.userId || !body.role) {
    return c.json({ error: "userId and role are required" }, 400);
  }

  // Only owners can add admins
  if (body.role === "admin" && role !== "owner") {
    return c.json({ error: "Only owners can add admins" }, 403);
  }

  const member = await service.addMember({
    orgId,
    userId: body.userId,
    role: body.role,
  });

  if (!member) {
    return c.json({ error: "Member already exists" }, 409);
  }

  return c.json(member, 201);
});

// Remove member from organization (requires auth + admin/owner role)
orgRoutes.delete("/:id/members/:userId", authMiddleware, async (c) => {
  const requesterId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const targetUserId = c.req.param("userId");
  if (!targetUserId) return c.json({ error: "User ID required" }, 400);

  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, requesterId);
  if (!role || role === "member") {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Cannot remove owners
  const targetRole = await service.getMemberRole(orgId, targetUserId);
  if (targetRole === "owner") {
    return c.json({ error: "Cannot remove owner" }, 400);
  }

  // Only owners can remove admins
  if (targetRole === "admin" && role !== "owner") {
    return c.json({ error: "Only owners can remove admins" }, 403);
  }

  await service.removeMember(orgId, targetUserId);

  return c.json({ ok: true });
});

// Set org token (requires auth + owner role)
orgRoutes.put("/:id/token", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, userId);
  if (role !== "owner") {
    return c.json({ error: "Only owners can manage the org token" }, 403);
  }

  const org = await service.getOrgById(orgId);
  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }

  if (org.mintAddress) {
    return c.json({ error: "Organization already has a token. Remove it first." }, 409);
  }

  if (body.action === "create") {
    if (!body.name || !body.symbol || body.decimals === undefined || !body.amount) {
      return c.json({ error: "name, symbol, decimals, and amount are required for create" }, 400);
    }

    const tokenService = createTokenService(db);
    const rpcUrl = c.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

    const metadataUri = await uploadMetadataJson(
      body.name,
      body.symbol,
      body.imageUrl,
      c.env.TOKEN_ASSETS,
      c.req.url,
    );

    try {
      const result = await createPlatformToken({
        secretKeyJson: c.env.PLATFORM_SECRET_KEY,
        rpcUrl,
        name: body.name,
        symbol: body.symbol,
        decimals: body.decimals,
        amount: body.amount,
        creatorAddress: userId,
        metadataUri,
      });

      await tokenService.recordToken({
        mintAddress: result.mintAddress,
        creatorAddress: userId,
        name: body.name,
        symbol: body.symbol,
        decimals: body.decimals,
        supply: result.supply,
        metadataUri,
      });

      const updated = await service.setOrgToken(orgId, {
        mintAddress: result.mintAddress,
        tokenName: body.name,
        tokenSymbol: body.symbol,
        tokenDecimals: body.decimals,
      });

      return c.json(updated, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: msg }, 500);
    }
  }

  if (body.action === "link") {
    if (!body.mintAddress) {
      return c.json({ error: "mintAddress is required for link" }, 400);
    }

    const updated = await service.setOrgToken(orgId, {
      mintAddress: body.mintAddress,
      tokenName: body.tokenName ?? null,
      tokenSymbol: body.tokenSymbol ?? null,
      tokenDecimals: body.tokenDecimals ?? 9,
    });

    return c.json(updated, 200);
  }

  return c.json({ error: "action must be 'create' or 'link'" }, 400);
});

// Remove org token (requires auth + owner role)
orgRoutes.delete("/:id/token", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, userId);
  if (role !== "owner") {
    return c.json({ error: "Only owners can manage the org token" }, 403);
  }

  const org = await service.getOrgById(orgId);
  if (!org?.mintAddress) {
    return c.json({ error: "Organization has no token" }, 404);
  }

  await service.removeOrgToken(orgId);
  return c.json({ ok: true });
});

// Delete organization (requires auth + owner role)
orgRoutes.delete("/:id", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("id");
  if (!orgId) return c.json({ error: "Organization ID required" }, 400);

  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const role = await service.getMemberRole(orgId, userId);
  if (role !== "owner") {
    return c.json({ error: "Only the owner can delete the organization" }, 403);
  }

  const org = await service.getOrgById(orgId);
  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }

  await service.deleteOrg(orgId);

  return c.json({ ok: true });
});

// List current user's organizations (requires auth)
orgRoutes.get("/me/list", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const orgs = await service.listUserOrgs(userId);
  return c.json(orgs);
});
