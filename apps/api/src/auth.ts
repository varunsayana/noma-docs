import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Use require for the CommonJS database package
const { prisma } = require("database");

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET env var is not set!");
  process.exit(1);
}

function setTokenCookie(res: express.Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// POST /api/auth/setup - Create the first admin (only works if no users exist)
authRouter.post("/setup", async (req: express.Request, res: express.Response) => {
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      return res.status(403).json({ error: "Setup already complete" });
    }
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || "Admin", isAdmin: true },
    });
    const token = jwt.sign({ userId: user.id, isAdmin: true }, JWT_SECRET, { expiresIn: "7d" });
    setTokenCookie(res, token);
    return res.json({ user: { id: user.id, email: user.email, name: user.name, isAdmin: true }, token });
  } catch (error) {
    console.error("Setup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/setup-status - Check if setup is complete
authRouter.get("/setup-status", async (_req: express.Request, res: express.Response) => {
  try {
    const count = await prisma.user.count();
    return res.json({ setupComplete: count > 0 });
  } catch (error) {
    console.error("Setup status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });
    setTokenCookie(res, token);
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/logout
authRouter.post("/logout", (_req: express.Request, res: express.Response) => {
  res.clearCookie("token");
  return res.json({ success: true });
});

// GET /api/auth/me - returns current user from cookie/token
authRouter.get("/me", async (req: express.Request, res: express.Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, isAdmin: true },
    });
    if (!user) return res.status(401).json({ error: "User not found" });
    return res.json({ user });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});
