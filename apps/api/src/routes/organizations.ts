import { Hono } from "hono";

import type { Env } from "../../env";

import { createDb } from "../db";
import { authMiddleware, getUserId } from "../middleware/auth";
import { createOrgService } from "../services/org-service";

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

// List current user's organizations (requires auth)
orgRoutes.get("/me/list", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const db = createDb(c.env.DB);
  const service = createOrgService(db);

  const orgs = await service.listUserOrgs(userId);
  return c.json(orgs);
});
