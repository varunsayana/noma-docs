import express from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback";

export interface AuthRequest extends express.Request {
  userId: string;
  userIsAdmin: boolean;
}

export function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      isAdmin: boolean;
    };
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userIsAdmin = payload.isAdmin;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
