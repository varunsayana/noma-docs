import express from "express";
import { requireAuth, AuthRequest } from "./middleware";
const { prisma } = require("database");

export const workspaceRouter = express.Router();

// GET /api/workspaces — list all workspaces for the current user
workspaceRouter.get("/", requireAuth, async (req, res) => {
  const userId = (req as AuthRequest).userId;
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: { workspaces: true },
        },
      },
    });
    const workspaces = memberships.flatMap(
      (m: any) => m.organization.workspaces
    );
    return res.json({ workspaces });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});

// GET /api/workspaces/:id — get single workspace with document tree
workspaceRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: {
        folders: { orderBy: { createdAt: "asc" } },
        documents: {
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, folderId: true, createdAt: true, updatedAt: true },
        },
      },
    });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });
    return res.json({ workspace });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch workspace" });
  }
});

// POST /api/workspaces — create a new workspace
workspaceRouter.post("/", requireAuth, async (req, res) => {
  const userId = (req as AuthRequest).userId;
  const { name } = req.body;
  try {
    let org = await prisma.organization.findFirst({
      where: { memberships: { some: { userId } } },
    });

    if (!org) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      org = await prisma.organization.create({
        data: {
          name: (user?.name || "My Org") + "'s Organization",
          slug: `org-${userId.slice(0, 8)}-${Date.now()}`,
          memberships: { create: { userId, role: "OWNER" } },
        },
      });
    }

    const workspace = await prisma.workspace.create({
      data: { name: name || "My Workspace", orgId: org.id },
    });
    return res.status(201).json({ workspace });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create workspace" });
  }
});
