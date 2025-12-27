# Server

The backend API server for the Finance application. Built with Express and tRPC, providing type-safe API endpoints that are consumed by the web frontend.

## Tech Stack

| Technology  | Purpose                                      |
| ----------- | -------------------------------------------- |
| Express 5   | HTTP server and middleware                   |
| tRPC 11     | Type-safe API layer with end-to-end typing   |
| Drizzle ORM | Type-safe database queries                   |
| PostgreSQL  | Relational database                          |
| Zod         | Runtime schema validation for inputs/outputs |
| envalid     | Environment variable validation              |
| TypeScript  | Static type checking                         |

## Architecture

```
src/
├── index.ts          # Server startup (calls app.listen)
├── app.ts            # Express app factory (for testability)
├── env.ts            # Environment configuration (envalid)
├── db/               # Database client and schema
│   ├── index.ts      # Drizzle client initialization
│   └── schema/       # Table definitions (per-domain)
├── trpc/             # tRPC initialization and context
├── routers/          # App router (combines domain routers)
├── test/             # Test utilities
│   ├── setup.ts      # Global test hooks (beforeEach/afterEach)
│   └── db.ts         # Transaction management for tests
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
pnpm test          # Run tests
pnpm test:watch    # Run tests in watch mode
pnpm typecheck     # Run TypeScript type checking
pnpm lint          # Run oxlint, then ESLint
pnpm format        # Format with Prettier
```

## Testing

The server uses [Vitest](https://vitest.dev/) with a typed tRPC client for integration tests.

### Test Isolation

Each test runs within a PostgreSQL transaction that:

1. **Before each test**: Starts a transaction, truncates all tables
2. **During test**: Seeds data and runs assertions
3. **After each test**: Rolls back the transaction (all changes undone)

This provides complete isolation between tests without needing to manage cleanup.

### Running Tests

```bash
pnpm --filter @finance/server test        # Run once
pnpm --filter @finance/server test:watch  # Watch mode
```

### Writing Tests

Use `createTestClient()` for typed tRPC procedure calls:

```typescript
import { TRPCError } from '@trpc/server'
import { describe, expect, it } from 'vitest'

import { createTestClient } from './trpc-client'

describe('Auth', () => {
  it('registers a new user', async () => {
    const client = createTestClient()

    const result = await client.trpc.auth.register({
      email: 'test@example.com',
      name: 'Test User',
    })

    expect(result.userId).toBeDefined()
  })

  it('rejects duplicate email', async () => {
    const client = createTestClient()
    await client.trpc.auth.register({ email: 'test@example.com', name: 'Test' })

    await expect(
      client.trpc.auth.register({ email: 'test@example.com', name: 'Test' })
    ).rejects.toThrow(TRPCError)
  })
})
```

The `TestClient` uses `createCaller` to call procedures directly (no HTTP overhead) while still running all middlewares. It manages mock cookies to maintain session state between calls.

For Express routes (like `/health`), use `createTestApp()` with supertest:

```typescript
import request from 'supertest'
import { createTestApp } from './db'

it('returns status ok', async () => {
  const app = createTestApp()
  const response = await request(app).get('/health')
  expect(response.status).toBe(200)
})
```

### Key Files

| File                      | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `vitest.config.ts`        | Vitest configuration                        |
| `src/test/setup.ts`       | Global beforeEach/afterEach hooks           |
| `src/test/db.ts`          | Transaction management, `createTestApp()`   |
| `src/test/trpc-client.ts` | Typed tRPC client with session management   |
| `src/app.ts`              | Express app factory (supports db injection) |

## Linting

The server uses a two-tier linting setup for optimal performance:

1. **oxlint** - Rust-based linter (50-100x faster), runs first for quick feedback
2. **ESLint** - Runs second for type-checked rules and plugins oxlint doesn't cover

### Why Both?

| Linter  | Strengths                                         |
| ------- | ------------------------------------------------- |
| oxlint  | Speed, core JS/TS rules                           |
| ESLint  | Type-checked rules, import sorting, custom rules  |

### Configuration

- `eslint.config.js` - ESLint flat config with `eslint-plugin-oxlint` to disable overlapping rules
- oxlint uses sensible defaults (no config file needed)

To run commands for just this package:

```bash
pnpm --filter @finance/server dev
pnpm --filter @finance/server build
```

## Database

The server uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

### Local Setup

1. Start PostgreSQL using Docker Compose (from repo root):

   ```bash
   docker-compose up -d
   ```

2. Push the schema to the database:
   ```bash
   pnpm --filter @finance/server db:push
   ```

### Commands

| Command       | Description                                       |
| ------------- | ------------------------------------------------- |
| `db:generate` | Generate migrations from schema changes           |
| `db:migrate`  | Run pending migrations                            |
| `db:push`     | Push schema directly (dev only, skips migrations) |
| `db:studio`   | Open Drizzle Studio (visual database browser)     |

### Schema Organization

Schemas are organized per-domain in `src/db/schema/`:

```
src/db/
├── index.ts          # Database client initialization
└── schema/
    ├── index.ts      # Barrel export of all schemas
    └── auth.ts       # Auth domain tables (users, etc.)
```

### Adding a New Table

1. Create or update a schema file in `src/db/schema/`:

   ```typescript
   // src/db/schema/transactions.ts
   import { decimal, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

   export const transactions = pgTable('transactions', {
     id: uuid('id').primaryKey().defaultRandom(),
     // ... columns
   })
   ```

2. Export from the barrel file:

   ```typescript
   // src/db/schema/index.ts
   export * from './auth'
   export * from './transactions'
   ```

3. Generate and run migrations:
   ```bash
   pnpm --filter @finance/server db:generate
   pnpm --filter @finance/server db:migrate
   ```

### Conventions

- **UUIDs for primary keys** - Use `uuid('id').primaryKey().defaultRandom()`
- **Timestamps with timezone** - Use `timestamp('created_at', { withTimezone: true })`
- **Snake_case columns** - Match PostgreSQL conventions (`password_hash`, not `passwordHash`)
- **Export types** - Export `$inferSelect` and `$inferInsert` types for procedure use

## Configuration

### Path Aliases

The server uses `@server/*` as its TypeScript path alias:

| Alias       | Maps To   | Example                           |
| ----------- | --------- | --------------------------------- |
| `@server/*` | `./src/*` | `import { db } from '@server/db'` |

This is different from web's `@/*` alias intentionally. When web typechecks and follows imports into server source files, using a unique prefix prevents path resolution conflicts. See [ADR: Server Path Alias](../../docs/ADR/2025-12-26-server-path-alias.md) for details.

## Environment Variables

The server loads environment variables from the **repo root** `.env` file. Copy `/.env.example` to `/.env` and configure:

| Variable       | Description                               | Default                                                  |
| -------------- | ----------------------------------------- | -------------------------------------------------------- |
| `PORT`         | Server port                               | `3001`                                                   |
| `NODE_ENV`     | Environment (development/production/test) | `development`                                            |
| `WEB_URL`      | Frontend URL for CORS                     | `http://localhost:5173`                                  |
| `DATABASE_URL` | PostgreSQL connection string              | `postgresql://postgres:postgres@localhost:5432/postgres` |
| `LOG_LEVEL`    | Minimum log level                         | `debug` (dev) / `info` (prod)                            |

## Logging

The server uses [Pino](https://getpino.io/) for structured logging. Every request gets a logger with context (requestId, path, input) automatically attached.

### Using the Logger

In procedures, access the logger via `ctx.log`:

```typescript
export const login = publicProcedure
  .input(loginInput)
  .mutation(async ({ input, ctx: { db, log } }) => {
    log.info({ userId: user.id }, 'User logged in')
  })
```

For non-request logging (startup, background jobs):

```typescript
import { logger } from '@server/lib/logger'
logger.info({ port }, 'Server started')
```

### Key Files

| File              | Purpose                              |
| ----------------- | ------------------------------------ |
| `src/lib/logger.ts` | Pino configuration, redaction paths |
| `src/trpc/index.ts` | Logging middleware                  |

See [SOP: Logging](../../docs/SOP/sop-logging.md) for full documentation.

## API Endpoints

| Endpoint  | Description                               |
| --------- | ----------------------------------------- |
| `/trpc/*` | tRPC API routes                           |
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

| README                                           | When to Use                                                 |
| ------------------------------------------------ | ----------------------------------------------------------- |
| [`src/test/README.md`](src/test/README.md)       | Writing tests, TestClient usage, test utilities             |
| [`src/trpc/README.md`](src/trpc/README.md)       | tRPC setup, procedures, middleware, context                 |
| [`src/domains/README.md`](src/domains/README.md) | Adding new domains, creating procedures, domain conventions |
