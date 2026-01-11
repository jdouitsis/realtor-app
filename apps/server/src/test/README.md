# Server Testing

Integration tests for the server using Vitest with a typed tRPC client.

## Architecture

```
src/test/
├── setup.ts        # Global beforeEach/afterEach hooks
├── db.ts           # Database transaction management
├── trpc-client.ts  # Typed tRPC client with session handling
├── health.test.ts  # Express endpoint tests
└── auth.test.ts    # Auth flow integration tests
```

## Key Concepts

### Test Isolation

Each test runs in a PostgreSQL transaction that gets rolled back after the test:

1. `beforeEach`: Start transaction, truncate all tables
2. Test runs with clean database
3. `afterEach`: Rollback transaction (all changes undone)

This provides complete isolation without manual cleanup.

### TestClient

The `TestClient` class provides a typed tRPC caller with automatic session management:

```typescript
import { createTestClient } from './trpc-client'

it('authenticates user', async () => {
  const client = createTestClient()

  // Register and verify - session token is automatically captured
  const { email } = await client.trpc.auth.register({ email: 'test@example.com', name: 'Test' })
  const otp = await getLatestOtpCode(email)
  await client.trpc.auth.verifyOtp({ email, code: otp })

  // Subsequent calls include the session token
  const user = await client.trpc.auth.me()
  expect(user).not.toBeNull()
})
```

**How it works:**

- Uses `createCaller` to call tRPC procedures directly (no HTTP overhead)
- Mocks Express `req`/`res` objects to capture cookies
- Persists cookies between calls to maintain session state
- All tRPC middlewares still run (auth, rate limiting, logging)

### Testing Express Routes

For non-tRPC routes (like `/health`), use `createTestApp()` with supertest:

```typescript
import request from 'supertest'
import { createTestApp } from './db'

it('returns health status', async () => {
  const app = createTestApp()
  const res = await request(app).get('/health')
  expect(res.status).toBe(200)
})
```

## Utilities

| Function            | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `createTestClient`  | Creates typed tRPC client with session handling  |
| `createTestApp`     | Creates Express app with test transaction        |
| `getCurrentTx`      | Returns current test transaction for direct queries |

## Running Tests

```bash
pnpm --filter @concordpoint/server test        # Run once
pnpm --filter @concordpoint/server test:watch  # Watch mode
```

## Writing Tests

1. **Use `createTestClient()`** for tRPC procedure tests
2. **Use `createTestApp()`** for Express route tests
3. **Query database directly** via `getCurrentTx()` when needed (e.g., fetching OTP codes)
4. **No cleanup needed** - transactions auto-rollback

### Example: Testing Auth Flow

```typescript
import { TRPCError } from '@trpc/server'
import { describe, expect, it } from 'vitest'

import { createTestClient } from './trpc-client'

describe('Auth', () => {
  it('prevents duplicate registration', async () => {
    const client = createTestClient()

    await client.trpc.auth.register({ email: 'test@example.com', name: 'Test' })

    // Second registration should fail
    await expect(
      client.trpc.auth.register({ email: 'test@example.com', name: 'Test' })
    ).rejects.toThrow(TRPCError)
  })
})
```

### Example: Checking Error Codes

```typescript
it('returns correct error for invalid OTP', async () => {
  const client = createTestClient()
  const { email } = await client.trpc.auth.register({ email: 'test@example.com', name: 'Test' })

  try {
    await client.trpc.auth.verifyOtp({ email, code: '000000' })
    expect.fail('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(TRPCError)
    expect((error as TRPCError).code).toBe('BAD_REQUEST')
  }
})
```
