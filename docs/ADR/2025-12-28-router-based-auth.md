# Decision: Router-Based Authentication State Management

**Date:** 2025-12-28
**Status:** Accepted (supersedes React Context-based auth)

## Context

The application previously used a React Context (`AuthContext`) to manage authentication state. This worked but had some drawbacks:

1. **Redundant state layers** - Auth state existed in both React Context (via `useStorage` hook) and localStorage, requiring synchronization
2. **Separate from routing** - Auth context was independent of the router, despite auth state being primarily used for route guards
3. **Prop drilling through providers** - App.tsx had to get auth from context then pass it to RouterProvider

The route guards in `beforeLoad` already checked `context.auth.isAuthenticated` to determine redirects. Making auth part of the router context directly simplifies the architecture.

## Decision

Remove `AuthContext` and manage auth entirely through TanStack Router's context system:

1. **Factory pattern** - `createAuth(router)` returns an auth object with `router.invalidate()` baked in
2. **Router context** - Auth is passed to `<RouterProvider context={{ auth }}>` in App.tsx
3. **Getter-based state** - `isAuthenticated` is a getter that reads from localStorage on each access
4. **Automatic redirects** - `router.invalidate()` triggers `beforeLoad` re-evaluation, handling redirects automatically

### Implementation

**App.tsx** creates auth and passes it to router:

```typescript
import { createAuth } from '@/lib/auth'
import { router } from './router'

const auth = createAuth(router)

export function App() {
  return <RouterProvider router={router} context={{ auth }} />
}
```

**Auth factory** (`lib/auth.ts`) returns object with router invalidation:

```typescript
export function createAuth(router: RouterLike): Auth {
  return {
    get isAuthenticated() {
      return getStorage('auth_token') !== null
    },
    async verifyOtp(email, code) {
      const res = await trpcClient.auth.verifyOtp.mutate({ email, code })
      setStorage('auth_token', res.token)
      void router.invalidate()
    },
    async logout() {
      await trpcClient.auth.logout.mutate()
      clearStorage('auth_token')
      void router.invalidate()
    },
    // ...
  }
}
```

**Components** access auth via route context:

```typescript
const routeApi = getRouteApi('/_authenticated')

function Header() {
  const { auth } = routeApi.useRouteContext()
  await auth.logout()
}
```

**Cross-tab sync** invalidates router when token changes in another tab:

```typescript
// router.ts
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token') {
    void router.invalidate()
  }
})
```

**UNAUTHORIZED errors** in QueryClient invalidate router instead of navigating:

```typescript
if (parsed.code === 'UNAUTHORIZED') {
  clearStorage('auth_token')
  void router.invalidate()  // Route guards handle redirect
}
```

## Alternatives Considered

### 1. Keep AuthContext, Pass to Router

Continue using AuthContext but simplify by removing redundant state.

**Rejected:** Still requires a separate React context layer when the router already has a context system.

### 2. Event-Based Invalidation

Auth methods dispatch custom events, router listens and invalidates.

**Rejected:** Adds indirection. Factory pattern with direct `router.invalidate()` calls is clearer.

### 3. Dynamic Import to Avoid Circular Dependency

Auth methods dynamically import router to call invalidate.

**Rejected:** Less explicit than factory pattern. Factory makes the dependency clear at creation time.

## Consequences

### Positive

- **Single source of truth** - localStorage is the authority, no React state sync issues
- **Simpler architecture** - No AuthProvider wrapper, no useAuth hook
- **Leverages TanStack Router** - Uses built-in context system as intended
- **Automatic redirects** - No explicit navigation after login/logout, route guards handle it
- **Type-safe route access** - `getRouteApi('/path')` provides typed context access

### Negative

- **Components coupled to routes** - Must specify route path in `getRouteApi()` call
- **Less familiar pattern** - Developers used to React Context may need to learn router context

### Removed Files

- `apps/web/src/features/auth/context/AuthContext.tsx`
- `apps/web/src/features/auth/hooks/useAuth.ts`

### New Files

- `apps/web/src/lib/auth.ts` - Auth factory with router invalidation

### Modified Files

- `apps/web/src/App.tsx` - Creates auth, passes to RouterProvider
- `apps/web/src/router.ts` - Simplified, cross-tab sync listener
- `apps/web/src/main.tsx` - Removed AuthProvider wrapper
- `apps/web/src/lib/query.ts` - Uses `router.invalidate()` instead of navigate
- `apps/web/src/lib/storage.ts` - Added `setStorage()` function
- Component files - Use `getRouteApi().useRouteContext()` instead of `useAuth()`
