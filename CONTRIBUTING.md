# Contributing to Noma Docs

First off, thank you for considering contributing to Noma Docs. It's people like you that make open source such a great community!

## Setup Local Development

We use `pnpm` and Turborepo to manage our monorepo. Since this application relies on PostgreSQL and Redis, you can use our Docker setup to spin those up locally.

1.  **Install tools:** Ensure you have Node.js 20+, pnpm 8+, and Docker installed.
2.  **Start Infra:** Run `docker-compose up -d postgres redis minio`.
3.  **Install packages:** Run `pnpm install` in the root directory.
4.  **Database:** Push schema via `cd packages/database && pnpm prisma db push`.
5.  **Start:** Run `make dev` or `pnpm run dev` at the root.

## Branching & Code Standards

-   **Dev Workflow:** All pull requests should be aimed at the `dev` branch. `main` is kept strict for stable production releases only. We enforce PR reviews.
-   **Structure:** If you're modifying React components, check `packages/ui` if the component is generic enough to be shared. If it's pure logic, update `apps/api` or `packages/database`.
-   **Security First:** Never commit secrets. For the backend, ensure all endpoints explicitly check Authorization via JWT (no open end-points except `/login` and `/register`). Passwords should exclusively use `bcryptjs` for hashing. The WebSocket (`Hocuspocus`) passes tokens via URL parameters which must be verified against the DB.

## Submitting a Pull Request

1.  Fork the repo and create your branch from `dev`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes (`pnpm run lint`).
4.  Issue that pull request!

We follow standard Keep a Changelog formatting for PR descriptions. Happy coding!
