# Noma Docs
The ultimate open-source, self-hostable workspace and collaborative documentation platform.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**Noma Docs** is a modern, modular, open-source alternative to tools like Notion and AFFiNE, designed exclusively for self-hosting. It features an elegant block-based document editor, an infinite edgeless canvas for brainstorming, real-time collaboration via Yjs, and an extensible architecture running on a clean TypeScript/Node stack.

## ✨ Features

- **Block-Based Editor**: High-performance rich text editor powered by Tiptap.
- **Edgeless Canvas**: Switch any document into an infinite whiteboard mode for conceptual mapping.
- **Real-Time Collaboration**: Instant multiplayer syncing cursor presence powered by Yjs and Hocuspocus.
- **Full Data Ownership**: 100% self-hosted architecture using PostgreSQL, Redis, and MinIO. No hidden SaaS APIs.
- **Granular Permissions**: Built-in RBAC (Owner, Admin, Member, Guest) at the workspace level.
- **Customizable Organization**: Workspaces, Nested Folders, Backlinks, and more.

## 🏗️ Architecture Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui.
- **Backend API**: Node.js, Express modular backend.
- **WebSockets Engine**: Hocuspocus with Redis extension for multi-server scaling.
- **Database**: PostgreSQL with Prisma ORM.
- **Storage**: MinIO (S3-compatible) for offline, local-first file persistence.
- **Cache**: Redis.

## 🚀 Quick Start (Self-Hosting via Docker)

Running Noma Docs is as simple as bringing up the Docker Compose stack.

1. Clone the repository:
   ```bash
   git clone https://github.com/noma-docs/noma-docs.git
   cd noma-docs
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Boot the environment:
   ```bash
   make dev
   ```
   Or explicitly using Docker:
   ```bash
   docker-compose up --build
   ```

Noma Docs will be available at `http://localhost:3000`.

## 🛠️ Local Development

Please refer to `CONTRIBUTING.md` for guidelines on branching, setting up `pnpm`, and standard procedures.

### Monorepo Structure

- `apps/web`: Next.js frontend application.
- `apps/api`: Express.js backend and real-time collaboration server.
- `packages/database`: Prisma schema and generated type-safe client.
- `packages/ui`: Shared structural components and Tailwind configs.

## 🛡️ Security & Privacy

Privacy is our cornerstone. By self-hosting Noma Docs, your data never touches a 3rd party server. The application is audited for OWASP top 10 vulnerabilities, relies on HTTP-only strict JWT cookies for authentication, and ensures WebSocket connections are firmly authenticated.

## 📜 License

MIT License. See [LICENSE](LICENSE) for more details.