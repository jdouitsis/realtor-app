FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build/typecheck
FROM deps AS builder
COPY . .
RUN pnpm --filter @app/server typecheck

# Production image - keep full source for server (runs TypeScript)
FROM deps AS runner
COPY . .

WORKDIR /app/apps/server

EXPOSE 3001
ENV PORT=3001

# Run migrations then start server
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]
