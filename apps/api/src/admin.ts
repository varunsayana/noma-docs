import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const { prisma } = require("database");

export const adminRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback";

// Middleware: require valid admin JWT
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; isAdmin: boolean };
    if (!payload.isAdmin) return res.status(403).json({ error: "Admin access required" });
    (req as any).userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// GET /api/admin/users - list all users
adminRouter.get("/users", requireAdmin, async (_req: express.Request, res: express.Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ users });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users - create a user (admin only)
adminRouter.post("/users", requireAdmin, async (req: express.Request, res: express.Response) => {
  const { email, password, name, isAdmin } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split("@")[0],
        isAdmin: isAdmin === true,
      },
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
    });
    return res.status(201).json({ user });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/users/:id - delete a user (admin only, cannot delete self)
adminRouter.delete("/users/:id", requireAdmin, async (req: express.Request, res: express.Response) => {
  const targetId = req.params.id;
  const requesterId = (req as any).userId;
  if (targetId === requesterId) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }
  try {
    await prisma.user.delete({ where: { id: targetId } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:id - update user (reset password, toggle admin)
adminRouter.patch("/users/:id", requireAdmin, async (req: express.Request, res: express.Response) => {
  const targetId = req.params.id;
  const { password, name, isAdmin } = req.body;
  try {
    const data: Record<string, any> = {};
    if (password) data.passwordHash = await bcrypt.hash(password, 12);
    if (name) data.name = name;
    if (isAdmin !== undefined) data.isAdmin = isAdmin;
    const user = await prisma.user.update({
      where: { id: targetId },
      data,
      select: { id: true, email: true, name: true, isAdmin: true },
    });
    return res.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
