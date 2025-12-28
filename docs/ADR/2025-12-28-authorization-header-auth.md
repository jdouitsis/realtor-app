# Decision: Use Authorization Header Instead of Cookies for Authentication

**Date:** 2025-12-28
**Status:** Accepted (supersedes cookie transport from [Database Sessions](./2025-12-26-database-sessions.md))

## Context

The application uses separate subdomains for the web app (`app.jamesdouitsis.ca`) and API (`api.jamesdouitsis.ca`). Safari's Intelligent Tracking Prevention (ITP) blocks `Set-Cookie` headers from cross-origin responses, even when both subdomains share the same parent domain.

**Symptoms:**
- Login worked in Chrome/Firefox but failed in Safari (desktop and mobile)
- `Set-Cookie` header present in login response, but cookie not stored in Safari
- No cookies visible in Safari's Storage tab after authentication

**Root cause:** Safari treats cross-origin cookie setting as potential tracking, regardless of `sameSite` or domain settings.

## Decision

Store the session token in **localStorage** and send it via the **`Authorization: Bearer <token>`** header on every request.

**Server changes:**
- Return token in verifyOtp response body instead of setting cookie
- Read token from `Authorization` header instead of cookies

```typescript
// apps/server/src/domains/auth/lib/token.ts
export function getSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return null
}
```

**Client changes:**
- Store token in localStorage via type-safe `useStorage` hook
- Attach token to all requests via tRPC `headers()` function

```typescript
// apps/web/src/lib/trpc.ts
httpBatchLink({
  url: `${import.meta.env.VITE_API_URL}/trpc`,
  headers() {
    const token = getStorage('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
}),
```

**Authentication state:** Determined solely by token presence in localStorage. No server validation on mount - invalid tokens fail on first API call.

**Global error handling:** QueryClient clears token and redirects to `/login` on `UNAUTHORIZED` errors:

```typescript
// apps/web/src/lib/query.ts
queryCache: new QueryCache({
  onError: (error) => {
    const parsed = parseError(error)
    if (parsed.code === 'UNAUTHORIZED') {
      clearStorage('auth_token')
      void router.navigate({ to: '/login' })
    }
  },
}),
```

## Alternatives Considered

### 1. Single Domain with Path-Based Routing

Route everything through one domain (e.g., `app.jamesdouitsis.ca/trpc/*` proxied to API).

**Rejected:** Requires additional infrastructure (reverse proxy service like Caddy) on Railway, adding deployment complexity.

### 2. Safari Storage Access API

Request explicit permission to access cookies in cross-origin context.

**Rejected:** Requires user interaction (button click), poor UX, and user must have previously visited the API domain directly.

### 3. First-Party Redirect Flow

Login redirects to API domain to set cookie as first-party, then redirects back.

**Rejected:** Complex login flow with visible redirects, fragile, and still may be blocked by aggressive tracking prevention.

## Consequences

### Positive

- Works in all browsers including Safari with ITP enabled
- Simpler architecture (no proxy needed, no cookie domain configuration)
- CSRF protection improved (Authorization headers require explicit JavaScript, can't be sent by cross-origin forms)
- Cross-tab sync via localStorage `storage` event

### Negative

- **XSS vulnerability:** localStorage is accessible to JavaScript, unlike httpOnly cookies. Token can be stolen if XSS attack succeeds.
- Must clear token manually on logout (no automatic cookie expiry)

### Mitigations

- React's JSX escaping prevents most XSS vectors
- Content Security Policy (CSP) headers block inline scripts
- Server still validates token on every request - stolen tokens can be revoked server-side

## Related Changes

- `apps/server/src/domains/auth/lib/cookies.ts` renamed to `token.ts`
- Removed `setSessionCookie`, `clearSessionCookie` functions
- `apps/server/src/domains/auth/procedures/verifyOtp.ts` returns token in response
- `apps/web/src/lib/storage.ts` added `auth_token` to registry, `getStorage()` and `clearStorage()` functions
- `apps/web/src/lib/trpc.ts` sends Authorization header
- `apps/web/src/lib/query.ts` clears token on UNAUTHORIZED errors and invalidates router

**Note:** AuthContext was later removed in favor of router-based auth. See [Router-Based Auth](./2025-12-28-router-based-auth.md).
