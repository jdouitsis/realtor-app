# SOP: Server Logging

This document explains how logging works in the server application using Pino.

## Architecture

```
Express Request
    |
createContext (creates request logger with requestId)
    |
tRPC Middleware (enriches logger with path, type, input)
    |
    +--> "Request started" log
    |
Procedure (can access ctx.log for business event logging)
    |
    +--> "Request completed" log (with duration)
    |
Response
```

## Key Files

| File                              | Purpose                                            |
| --------------------------------- | -------------------------------------------------- |
| `apps/server/src/lib/logger.ts`   | Pino configuration, redaction paths, factory fn    |
| `apps/server/src/trpc/index.ts`   | Logger added to context, logging middleware        |
| `apps/server/src/index.ts`        | Express setup, onError uses logger                 |
| `apps/server/src/env.ts`          | LOG_LEVEL environment variable                     |

## Log Levels

| Level   | When to Use                                           | Example                              |
| ------- | ----------------------------------------------------- | ------------------------------------ |
| `trace` | Extremely detailed debugging                          | Rarely used                          |
| `debug` | Development debugging info                            | Variable values, flow tracing        |
| `info`  | Normal operations worth recording                     | Request start/end, business events   |
| `warn`  | Something unexpected but recoverable                  | Missing optional config, retries     |
| `error` | Something failed                                      | Exceptions, failed operations        |
| `fatal` | Application cannot continue                           | Startup failures                     |

The default level is `debug` in development and `info` in production.

## Using the Logger

### In Procedures

Every procedure has access to `ctx.log`, a child logger pre-configured with request context:

```typescript
export const login = publicProcedure
  .input(loginInput)
  .mutation(async ({ input, ctx: { db, log } }) => {
    const user = await findUser(db, input.email)

    if (!user) {
      log.warn({ email: input.email }, 'Login attempt for non-existent user')
      throw authError('USER_NOT_FOUND')
    }

    log.info({ userId: user.id }, 'OTP sent successfully')
    return { message: 'Check your email' }
  })
```

### Adding Extra Context

Use `.child()` to add context without modifying the original logger:

```typescript
const userLog = log.child({ userId: user.id, action: 'password-reset' })
userLog.info('Password reset initiated')
userLog.info('Email sent')  // userId and action still included
```

### Root Logger (Non-Request)

For logging outside of requests (startup, background jobs):

```typescript
import { logger } from '@/lib/logger'

logger.info({ port: 3001 }, 'Server started')
logger.error({ error }, 'Background job failed')
```

## Sensitive Data Redaction

In production, the following paths are automatically redacted:

| Path Pattern       | Covers                     |
| ------------------ | -------------------------- |
| `input.password`   | Registration passwords     |
| `input.code`       | OTP verification codes     |
| `input.token`      | Session/auth tokens        |
| `input.sessionToken` | Session tokens           |
| `input.otp`        | OTP codes                  |
| `*.password`       | Any nested password field  |
| `*.code`           | Any nested code field      |
| `*.token`          | Any nested token field     |

In development, all data is logged unredacted for easier debugging.

### Adding New Redaction Paths

Edit `apps/server/src/lib/logger.ts`:

```typescript
const REDACT_PATHS = [
  // ... existing paths
  'input.creditCard',
  '*.ssn',
]
```

## Log Output Format

Logs use `pino-pretty` for human-readable output in all environments:

```
[2024-01-15 10:30:45.123] INFO (auth.login): Request started
    requestId: "abc123_def456"
    path: "auth.login"
    type: "mutation"
    input: { "email": "user@example.com" }

[2024-01-15 10:30:45.456] INFO (auth.login): Request completed
    requestId: "abc123_def456"
    path: "auth.login"
    duration: 333
    success: true
```

## Environment Variables

| Variable    | Default (Dev) | Default (Prod) | Description                |
| ----------- | ------------- | -------------- | -------------------------- |
| `LOG_LEVEL` | `debug`       | `info`         | Minimum level to log       |

## What Gets Logged Automatically

The logging middleware automatically captures:

1. **Request started** (debug level) - When procedure begins
   - `requestId`, `path`, `type`, `input` (redacted in prod)

2. **Request completed** (debug level) - When procedure succeeds
   - `duration` (ms), `success: true`

3. **Request failed** (error level) - When procedure throws
   - `duration` (ms), `success: false`

4. **Errors** (error level) - Via `onError` hook
   - `path`, `type`, `code`, `stack` (dev only)

In production (LOG_LEVEL=info), request start/completed logs are hidden to reduce noise. Only errors and explicit info/warn logs appear.

## What NOT to Log

- Health check requests (`/health`) - Too noisy
- Database queries - Use query logging at DB level if needed
- Successful email sends - Log failures only
- Password/token values - Use redaction

## Troubleshooting

### "Logs show [REDACTED]"

**Cause:** You're in production mode and the field matches a redaction path.

**Fix:** Either switch to development mode or check `REDACT_PATHS` in `lib/logger.ts`.

### "Log level not changing"

**Cause:** `LOG_LEVEL` env var not being picked up.

**Fix:** Ensure it's set before server starts. Check `.env` file or environment.

### "Missing request context in logs"

**Cause:** Using root `logger` instead of `ctx.log`.

**Fix:** In procedures, always use `ctx.log`:

```typescript
// Wrong - no request context
import { logger } from '@/lib/logger'
logger.info('Something happened')

// Correct - includes requestId, path, etc.
ctx.log.info('Something happened')
```

### "Logs not appearing"

**Cause:** Log level is higher than the log being written.

**Fix:** Check `LOG_LEVEL`. If set to `warn`, you won't see `info` or `debug` logs.

## ESLint Enforcement

The server has `no-console` enabled as an ESLint error. All logging must use Pino:

```typescript
// ESLint error - use logger instead
console.log('Something happened')
console.error('Something failed')

// Correct
logger.info('Something happened')
logger.error({ error }, 'Something failed')
```

## Principles

1. **Use structured logging** - Pass objects, not string concatenation
2. **Include identifiers** - Always include relevant IDs (userId, orderId, etc.)
3. **Log at boundaries** - Request start/end, external API calls, business events
4. **Don't over-log** - Skip routine success cases, log failures and anomalies
5. **Use appropriate levels** - `info` for normal ops, `warn` for recoverable issues, `error` for failures
6. **No console.log** - ESLint enforces using Pino instead
