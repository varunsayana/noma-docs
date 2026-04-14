FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm and openssl for Prisma
RUN npm install -g pnpm
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml turbo.json ./

# Copy package structures
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/

# Copy full code for api and database
COPY apps/api ./apps/api
COPY packages/database ./packages/database

# Install dependencies for workspace
RUN pnpm install

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build the API
WORKDIR /app/apps/api
RUN pnpm run build

# Expose API and WebSocket Port
EXPOSE 4000

# Start server
CMD ["pnpm", "run", "start"]
