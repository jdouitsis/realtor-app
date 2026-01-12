# Decision: Use Database Sessions for Authentication

**Date:** 2025-12-26
**Status:** Accepted

## Context

After OTP verification, users need a session to stay authenticated. The two main approaches are:

1. **Stateless (JWT):** Token contains user data, validated cryptographically
2. **Stateful (Database):** Token is a random ID, looked up in database

For a Realtor App application, security considerations are paramount.

## Decision

Use **database-backed sessions** stored in a `sessions` table. Session tokens are random 256-bit strings stored in **httpOnly cookies**.

**Schema:**

```typescript
sessions: {
  id: uuid (primary key)
  userId: uuid (foreign key → users)
  token: text (unique, indexed)
  expiresAt: timestamp
  createdAt: timestamp
  lastActiveAt: timestamp
}
```

**Session lifetime:** 30 days, with rolling expiry on activity.

**Cookie Configuration:**

```typescript
{
  httpOnly: true,     // JS cannot access
  secure: true,       // HTTPS only (in production)
  sameSite: 'lax',    // CSRF protection
  path: '/',
  maxAge: 30 * 24 * 60 * 60  // 30 days
}
```

**CSRF Protection:** Using `sameSite: 'lax'` prevents CSRF for state-changing requests. No additional CSRF token needed.

## Alternatives Considered

### JWT (Stateless)

- No database lookup per request
- Scales horizontally without shared state
- Self-contained user information

**Rejected for Realtor App because:**

- Cannot revoke individual sessions immediately
- "Logout everywhere" requires a blacklist (negates stateless benefit)
- Token theft has longer exposure window
- Token size grows with embedded data

### JWT with Database Blacklist

- Revocation via blacklist table
- Still mostly stateless

**Rejected:** Database lookup for blacklist check negates the main benefit of JWT while keeping its downsides.

### Redis Sessions

- Faster lookups than PostgreSQL
- Built-in TTL support

**Rejected:** Adds infrastructure complexity. PostgreSQL is sufficient for current scale. Can migrate to Redis later if performance requires.

## Consequences

### Positive

- Immediate session revocation (security incident response)
- "Logout all devices" is trivial (`DELETE FROM sessions WHERE userId = ?`)
- Session activity tracking (lastActiveAt)
- No token size concerns
- Simpler implementation (no crypto verification)

### Negative

- Database lookup on every authenticated request
- Horizontal scaling requires shared database access
- Session table grows over time (needs cleanup job)

### Mitigations

- Index on `token` column for fast lookups
- Scheduled job to delete expired sessions
- Connection pooling for database efficiency
