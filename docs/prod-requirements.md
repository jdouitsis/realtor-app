# Production Requirements

Future improvements to address before production-ready release.

## Table of Contents

- [High Priority](#high-priority)
  - [Custom Domain for Cookie Security](#custom-domain-for-cookie-security)
- [Medium Priority](#medium-priority)
- [Low Priority](#low-priority)

## High Priority

### Custom Domain for Cookie Security

**Current state**: Using `sameSite: 'none'` for cross-origin cookies between Railway services.

**Problem**: `sameSite: 'none'` is less secure and may be blocked by browsers with strict third-party cookie policies.

**Solution**: Set up a custom domain with shared parent:

- Web → `app.myapp.com`
- Server → `api.myapp.com`

Then update `apps/server/src/domains/auth/lib/cookies.ts`:

```typescript
res.cookie(SESSION_COOKIE_NAME, token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  domain: '.myapp.com', // Shared parent domain
  maxAge: SESSION_DURATION_MS,
})
```

## Medium Priority

_None yet_

## Low Priority

_None yet_
