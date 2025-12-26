# Server

The backend API server for the Finance application. Built with Express and tRPC, providing type-safe API endpoints that are consumed by the web frontend.

## Tech Stack

| Technology | Purpose                                      |
| ---------- | -------------------------------------------- |
| Express 5  | HTTP server and middleware                   |
| tRPC 11    | Type-safe API layer with end-to-end typing   |
| Zod        | Runtime schema validation for inputs/outputs |
| envalid    | Environment variable validation              |
| TypeScript | Static type checking                         |

## Architecture

```
src/
├── index.ts          # Express server entry point
├── env.ts            # Environment configuration (envalid)
├── trpc/             # tRPC initialization and context
├── routers/          # App router (combines domain routers)
└── domains/          # Feature-based domain modules
    └── {domain}/
        ├── procedures/   # Individual tRPC procedures
        └── router.ts     # Domain router
```

The server follows a **domain-driven structure** where each feature area (auth, transactions, etc.) is organized as a self-contained domain with its own procedures and router.

## Commands

All commands are run from the monorepo root via Turborepo:

```bash
pnpm dev           # Start dev server with hot reload (tsx watch)
pnpm build         # Compile TypeScript to dist/
pnpm typecheck     # Run TypeScript type checking
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
```

To run commands for just this package:

```bash
pnpm --filter @finance/server dev
pnpm --filter @finance/server build
```

## Prettier

Run `pnpm format` to format code with Prettier.

### Import Ordering

Imports are automatically sorted using [@ianvs/prettier-plugin-sort-imports](https://github.com/IanVS/prettier-plugin-sort-imports).

| Order | Group            | Pattern              | Examples                              |
| ----- | ---------------- | -------------------- | ------------------------------------- |
| 1     | Node.js built-in | `<BUILTIN_MODULES>`  | `fs`, `path`, `crypto`                |
| 2     | Express          | `express`            | `import express from 'express'`       |
| 3     | tRPC             | `@trpc/*`            | `@trpc/server`, `@trpc/server/adapters/express` |
| 4     | Third-party      | All other externals  | `zod`, `cors`, `envalid`              |
|       | *(blank line)*   |                      |                                       |
| 5     | Relative imports | `./`, `../`          | `./routers`, `../trpc`                |

Type imports are combined inline with value imports. Specifiers within each import statement are sorted alphabetically.

## Environment Variables

The server loads environment variables from the **repo root** `.env` file. Copy `/.env.example` to `/.env` and configure:

| Variable   | Description                               | Default                 |
| ---------- | ----------------------------------------- | ----------------------- |
| `PORT`     | Server port                               | `3001`                  |
| `NODE_ENV` | Environment (development/production/test) | `development`           |
| `WEB_URL`  | Frontend URL for CORS                     | `http://localhost:5173` |

## API Endpoints

| Endpoint  | Description                    |
| --------- | ------------------------------ |
| `/trpc/*` | tRPC API routes                |
| `/health` | Health check (returns `{ status: 'ok' }`) |

## Type Sharing

The server exports its router types for the frontend to consume:

```typescript
// In apps/web, the tRPC client imports types from:
import type { AppRouter } from '@finance/server/trpc'
```

This enables full end-to-end type safety between frontend and backend.

## Deployment

The server is configured for deployment on Railway:

- `railway.json` - Railway deployment configuration
- `nixpacks.toml` - Build configuration (Node 22, pnpm)
- Health check endpoint: `/health`

## README Index

| README                                   | When to Use                                                    |
| ---------------------------------------- | -------------------------------------------------------------- |
| [`src/domains/README.md`](src/domains/README.md) | Adding new domains, creating procedures, domain conventions |
