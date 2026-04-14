import express from "express";
import { requireAuth, AuthRequest } from "./middleware";
const { prisma } = require("database");

export const documentRouter = express.Router();

// GET /api/documents?workspaceId=xxx — list all docs in a workspace
documentRouter.get("/", requireAuth, async (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });
  try {
    const documents = await prisma.document.findMany({
      where: { workspaceId },
      select: {
        id: true, title: true, folderId: true,
        createdAt: true, updatedAt: true,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return res.json({ documents });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// GET /api/documents/:id — get single document with content
documentRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { creator: { select: { id: true, name: true } } },
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Parse content from bytes buffer
    let contentJson = null;
    if (doc.content) {
      try {
        contentJson = JSON.parse(Buffer.from(doc.content).toString("utf8"));
      } catch {
        contentJson = null;
      }
    }
    return res.json({ document: { ...doc, contentJson } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch document" });
  }
});

// POST /api/documents — create a new document
documentRouter.post("/", requireAuth, async (req, res) => {
  const userId = (req as AuthRequest).userId;
  const { workspaceId, title, folderId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });
  try {
    const doc = await prisma.document.create({
      data: {
        title: title || "Untitled",
        workspaceId,
        folderId: folderId || null,
        creatorId: userId,
      },
      select: { id: true, title: true, folderId: true, createdAt: true, updatedAt: true },
    });
    return res.status(201).json({ document: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create document" });
  }
});

// PUT /api/documents/:id — update title and/or content
documentRouter.put("/:id", requireAuth, async (req, res) => {
  const { title, contentJson } = req.body;
  const data: Record<string, any> = {};
  if (title !== undefined) data.title = title;
  if (contentJson !== undefined) {
    data.content = Buffer.from(JSON.stringify(contentJson));
  }
  try {
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data,
      select: { id: true, title: true, updatedAt: true },
    });
    return res.json({ document: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update document" });
  }
});

// DELETE /api/documents/:id — delete a document
documentRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete document" });
  }
});
