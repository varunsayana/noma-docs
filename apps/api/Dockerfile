FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm and openssl for Prisma
RUN npm install -g pnpm
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml turbo.json ./

# Copy package structures first (for better layer caching)
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/

# Copy full source
COPY apps/api ./apps/api
COPY packages/database ./packages/database

# Install all workspace deps
RUN pnpm install

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build the API TypeScript
WORKDIR /app/apps/api
RUN pnpm run build

# Expose API port
EXPOSE 4000

# On start: push schema to DB then start server
CMD ["sh", "-c", "cd /app/packages/database && npx prisma db push --skip-generate && cd /app/apps/api && node dist/index.js"]
