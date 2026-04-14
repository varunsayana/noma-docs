FROM node:20-alpine

WORKDIR /app

# Install pnpm and openssl for Prisma
RUN npm install -g pnpm
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy workspace config
COPY package.json pnpm-workspace.yaml turbo.json ./

# Copy packages
COPY apps/web/package.json apps/web/
COPY packages/database/package.json packages/database/

# Copy code
COPY apps/web ./apps/web
COPY packages/database ./packages/database

# Install deps
RUN pnpm install

# Build Next.js
WORKDIR /app/apps/web
RUN pnpm run build

# Expose Port
EXPOSE 3000

# Start Next.js
CMD ["pnpm", "run", "start"]
