import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressWebsockets from "express-ws";
import dotenv from "dotenv";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";

dotenv.config();

const { app } = expressWebsockets(express());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Security headers
app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Auth Routes
app.use("/api/auth", authRouter);

// Admin Routes (protected)
app.use("/api/admin", adminRouter);

// Health check
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok", service: "Noma Docs API" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Noma Docs API listening on port ${PORT}`);
});
