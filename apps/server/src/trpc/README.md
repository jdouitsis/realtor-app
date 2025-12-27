# tRPC Configuration

This directory contains the tRPC setup for the server, including initialization, middleware, and procedure definitions.

## Architecture

```
trpc/
├── init.ts        # tRPC initialization, context creation, error formatting
├── middlewares.ts # Logging and auth middleware
├── index.ts       # Procedures and public exports
└── README.md
```

## Files

| File             | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `init.ts`        | Initializes tRPC instance, creates request context   |
| `middlewares.ts` | Defines reusable middleware (logging, auth)          |
| `index.ts`       | Composes procedures, re-exports public API           |

## Context

Every request receives a context object created in `init.ts`:

```typescript
interface Context {
  req: Request          // Express request
  res: Response         // Express response
  db: Database          // Drizzle database instance
  requestId: string     // Unique ID for request tracing
  log: Logger           // Pino logger scoped to this request
}
```

For protected procedures, the context is extended with the authenticated user:

```typescript
interface ProtectedContext extends Context {
  user: User  // Authenticated user from session
}
```

## Procedures

### `publicProcedure`

Base procedure with logging middleware. Use for unauthenticated endpoints.

```typescript
import { publicProcedure } from '@server/trpc'

export const healthCheck = publicProcedure.query(() => {
  return { status: 'ok' }
})
```

### `protectedProcedure`

Extends `publicProcedure` with authentication. Validates session cookie and injects `user` into context. Throws `UNAUTHORIZED` if not authenticated.

```typescript
import { protectedProcedure } from '@server/trpc'

export const getProfile = protectedProcedure.query(({ ctx }) => {
  // ctx.user is guaranteed to exist
  return {
    id: ctx.user.id,
    email: ctx.user.email,
    name: ctx.user.name,
  }
})
```

## Middleware

### Logging Middleware

Applied to all procedures. Enriches the request logger with:

- `path` - Procedure path (e.g., `auth.login`)
- `type` - Request type (`query` or `mutation`)
- `input` - Request input (sensitive fields redacted in production)

Logs errors with duration on failure.

### Auth Middleware

Applied to `protectedProcedure`. Performs:

1. Extracts session token from cookie
2. Validates token via `sessionService.validate()`
3. Throws `UNAUTHORIZED` if missing or invalid
4. Adds `user` to context on success

## Error Formatting

All errors include:

| Field       | Description                                      |
| ----------- | ------------------------------------------------ |
| `requestId` | Unique request ID for tracing                    |
| `appCode`   | Application error code (e.g., `OTP_EXPIRED`)     |
| `zodError`  | Flattened Zod validation errors (if applicable)  |
| `stack`     | Stack trace (development only)                   |

## Adding New Middleware

1. Define the middleware in `middlewares.ts`:

```typescript
export const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  // Rate limiting logic
  return next({ ctx })
})
```

2. Create a new procedure or compose with existing ones in `index.ts`:

```typescript
export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware)
```

## Imports

Always import from `@server/trpc`:

```typescript
import { publicProcedure, protectedProcedure, router } from '@server/trpc'
import type { Context, ProtectedContext } from '@server/trpc'
```
