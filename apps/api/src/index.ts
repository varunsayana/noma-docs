import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";
import { Database } from "@hocuspocus/extension-database";
import expressWebsockets from "express-ws";
import { prisma } from "database";
import dotenv from "dotenv";
import { authRouter } from "./auth";

dotenv.config();

const { app } = expressWebsockets(express());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Hocuspocus Server setup
const server = Server.configure({
  name: "noma-docs-collab",
  extensions: [
    new Logger(),
    new Database({
      fetch: async ({ documentName }) => {
        return new Promise(async (resolve, reject) => {
          try {
            const doc = await prisma.document.findUnique({ where: { id: documentName } });
            if (doc?.content) {
              resolve(doc.content);
            } else {
              resolve(null);
            }
          } catch (e) {
            reject(e);
          }
        });
      },
      store: async ({ documentName, state }) => {
        try {
          await prisma.document.update({
             where: { id: documentName },
             data: { content: state }
          });
        } catch (e) {
          console.error("Failed to save doc to db:", e);
        }
      },
    }),
  ],
  async onAuthenticate(data) {
    // Implement token validation here (JWT) passed via connection params
    const token = data.requestParameters.get('token');
    if (!token) throw new Error("Unauthorized");
    // Verify token...
    return {
      user: { id: "mock-user-id" } // Replace with real user info
    }
  }
});

// Auth Routes
app.use("/api/auth", authRouter);

// WebSocket Route
app.ws("/collaboration", (websocket, request) => {
  server.handleConnection(websocket, request);
});

// HTTP REST API fallback
app.get("/", (req, res) => {
  res.send("Noma Docs API running.");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
