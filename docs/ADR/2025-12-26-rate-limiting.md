# Rate Limiting

**Date:** 2025-12-26

## Context

Authentication endpoints are vulnerable to brute force attacks without rate limiting:

- **Login/Register**: Attackers can spam requests to enumerate valid emails
- **OTP Verification**: 6-digit codes (1M combinations) can be brute-forced
- **OTP Resend**: Attackers can spam email requests, causing delivery issues

We needed a rate limiting solution that:

1. Integrates cleanly with tRPC middleware
2. Supports different limits for different endpoint types
3. Is simple to configure and extend
4. Works for single-instance deployments (with path to multi-instance)

## Decision

Implement rate limiting using `rate-limiter-flexible` with a tRPC middleware factory pattern.

### Architecture

```
createRateLimitMiddleware('auth')
         ↓
getRateLimitConfig('auth')  →  { prefix, points, duration }
         ↓
RateLimiterMemory instance
         ↓
tRPC middleware (checks IP, consumes point, throws TOO_MANY_REQUESTS)
```

### Usage

```typescript
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'

export const login = publicProcedure
  .use(createRateLimitMiddleware('auth'))  // 5 req/min
  .input(loginInput)
  .mutation(...)
```

### Rate Limit Types

| Type         | Points | Duration | Use Case           |
| ------------ | ------ | -------- | ------------------ |
| `auth`       | 5      | 60s      | Login, register    |
| `otpVerify`  | 5      | 900s     | OTP verification   |
| `otpRequest` | 3      | 300s     | OTP resend         |

## Alternatives Considered

### 1. Express-level rate limiting (`express-rate-limit`)

**Pros:** Simple, well-tested
**Cons:** Applies to all routes, no per-procedure granularity

### 2. Redis-backed rate limiting

**Pros:** Works across multiple instances
**Cons:** Adds infrastructure dependency, overkill for single-instance

### 3. Per-procedure inline configuration

```typescript
.use(createRateLimitMiddleware({ prefix: 'auth', points: 5, duration: 60 }))
```

**Pros:** Maximum flexibility
**Cons:** Verbose, easy to make mistakes, harder to maintain consistency

## Consequences

### Positive

- **Type-safe**: Only valid rate limit types are allowed
- **Consistent**: All auth endpoints use the same limits
- **Extensible**: Add new types to `rateLimitConfigs` in one place
- **Logged**: Rate limit violations are logged with IP and type

### Negative

- **In-memory only**: Resets on server restart, doesn't work across multiple instances
- **IP-based**: Can be bypassed with rotating IPs (acceptable for MVP)

### Future Considerations

For multi-instance deployments:

1. Swap `RateLimiterMemory` to `RateLimiterRedis` in `middlewares.ts`
2. Add Redis connection configuration
3. Consider adding user-based rate limiting (after authentication)

## Key Files

| File                            | Purpose                        |
| ------------------------------- | ------------------------------ |
| `src/lib/rate-limit.ts`         | Rate limit configs and types   |
| `src/trpc/middlewares.ts`       | Middleware factory function    |
| `src/domains/auth/procedures/*` | Procedures using rate limiting |
