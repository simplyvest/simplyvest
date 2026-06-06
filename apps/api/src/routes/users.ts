import { Hono } from "hono";

import type { Env } from "../../env";
import { authMiddleware, getUserId } from "../middleware/auth";
import { createDb } from "../db";
import { createUserService } from "../services/user-service";

export const userRoutes = new Hono<{ Bindings: Env }>();

// Get current user profile (requires auth)
userRoutes.get("/me", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const db = createDb(c.env.DB);
  const service = createUserService(db);

  const user = await service.getUserById(userId);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

// Create or update current user profile (requires auth)
userRoutes.post("/me", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createUserService(db);

  if (!body.walletAddress) {
    return c.json({ error: "walletAddress is required" }, 400);
  }

  const user = await service.upsertUser({
    id: userId,
    walletAddress: body.walletAddress,
    displayName: body.displayName,
    avatarUrl: body.avatarUrl,
    email: body.email,
  });

  return c.json(user);
});

// Update current user profile (requires auth)
userRoutes.put("/me", authMiddleware, async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  const db = createDb(c.env.DB);
  const service = createUserService(db);

  const user = await service.updateUser(userId, {
    displayName: body.displayName,
    avatarUrl: body.avatarUrl,
    email: body.email,
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

// Get public user profile by ID (no auth required)
userRoutes.get("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const service = createUserService(db);

  const user = await service.getUserById(c.req.param("id"));
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  // Return public fields only
  return c.json({
    id: user.id,
    walletAddress: user.walletAddress,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});
