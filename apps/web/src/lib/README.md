# Lib

Core utilities and configurations for the web application.

## Files

| File                | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `auth.ts`           | Auth factory with router invalidation             |
| `query.ts`          | TanStack Query client with global error handling  |
| `trpc.ts`           | tRPC client setup with React Query integration    |
| `errors.ts`         | Error parsing and user-friendly message mapping   |
| `storage.ts`        | Type-safe localStorage hook with cross-tab sync   |
| `router-context.ts` | TanStack Router context type definitions          |
| `utils.ts`          | General utilities (`cn` for Tailwind class merge) |

## Authentication

Authentication is managed via `auth.ts` and integrated with TanStack Router's context system.

### Architecture

```
App.tsx
  │
  ├── createAuth(router) → Auth object with router.invalidate() baked in
  │
  └── <RouterProvider context={{ auth }}>
        │
        └── Route components access via getRouteApi().useRouteContext()
```

### Auth Factory (`auth.ts`)

The `createAuth` factory takes the router and returns an auth object:

```typescript
export function createAuth(router: RouterLike): Auth {
  return {
    get isAuthenticated() {
      return getStorage('auth_token') !== null
    },
    async login(email, options) {
      // options.type: 'otp' (default) or 'magic' - determines auth method
      // options.redirectUrl: optional redirect after magic link verification
      const res = await trpcClient.auth.login.mutate({ email, ...options })
      return { email: res.email }
    },
    async register(email, name, options) {
      // Same options as login
      const res = await trpcClient.auth.register.mutate({ email, name, ...options })
      return { email: res.email }
    },
    async verifyOtp(email, code) {
      const res = await trpcClient.auth.verifyOtp.mutate({ email, code })
      setStorage('auth_token', res.token)
      void router.invalidate() // Triggers route guards to re-evaluate
    },
    async logout() {
      await trpcClient.auth.logout.mutate()
      clearStorage('auth_token')
      void router.invalidate() // Triggers redirect to login
    },
    // ...other methods
  }
}
```

### Auth Types

Both `login` and `register` support two authentication methods:

| Type    | Description                                    |
| ------- | ---------------------------------------------- |
| `otp`   | Sends a 6-digit code to verify via `verifyOtp` |
| `magic` | Sends a magic link that authenticates on click |

```typescript
// OTP flow (default)
await auth.login('user@example.com')
await auth.verifyOtp('user@example.com', '123456')

// Magic link flow
await auth.login('user@example.com', { type: 'magic', redirectUrl: '/dashboard' })
// User clicks link in email → automatically authenticated
```

### Accessing Auth in Components

Components access auth from route context using `getRouteApi`:

```typescript
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/_authenticated')

function Header() {
  const { auth } = routeApi.useRouteContext()

  const handleLogout = async () => {
    await auth.logout() // Clears token, invalidates router, redirects to login
  }
}
```

### How Router Invalidation Works

When `router.invalidate()` is called:

1. All matched routes re-run their `beforeLoad` guards
2. `beforeLoad` checks `context.auth.isAuthenticated` (getter reads from localStorage)
3. If not authenticated, `_authenticated` routes redirect to `/login`
4. If authenticated, `_public` routes redirect to `/dashboard`

This eliminates the need for explicit navigation after login/logout.

### Cross-Tab Sync

When the auth token changes in another browser tab, the router invalidates automatically:

```typescript
// router.ts
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token') {
    void router.invalidate()
  }
})
```

## Error Handling

### Overview

The app uses a centralized error handling strategy:

1. **Server** returns structured errors with `code` (tRPC) and `appCode` (app-specific)
2. **`errors.ts`** maps error codes to user-friendly messages
3. **`query.ts`** handles global error behaviors (redirects, logging)
4. **Components** use `parseError()` for display and form errors

### Global Error Handling in QueryClient

The `QueryClient` in `query.ts` provides global error handling via `QueryCache` and `MutationCache`:

```typescript
// query.ts handles these globally:
// - UNAUTHORIZED → clears auth token, invalidates router (triggers redirect via route guards)
// - REQUEST_NEW_OTP → redirects to /otp for step-up verification
// - All errors → logged with request ID for debugging
```

#### Step-Up OTP Flow

Sensitive operations (email change, account deletion) require recent OTP verification. When a user's OTP verification has expired:

1. Server returns `REQUEST_NEW_OTP` error code
2. `QueryClient.mutationCache.onError` catches it globally
3. User is redirected to `/otp?redirect=/current-path`
4. After OTP verification, user returns to complete the action

This is handled automatically - components don't need to check for this error.

### Using parseError()

For component-level error display:

```typescript
import { parseError } from '@/lib/errors'

const mutation = trpc.user.updateName.useMutation({
  onError: (error) => {
    const { userMessage } = parseError(error)
    setError(userMessage)
  },
})
```

### Adding New Error Codes

When adding a new `AppErrorCode` in `@concordpoint/shared/errors`:

1. Add the user-friendly message in `errors.ts`:

   ```typescript
   const APP_ERROR_MESSAGES: Record<AppErrorCode, string> = {
     // ... existing codes
     NEW_CODE: 'User-friendly message here.',
   }
   ```

2. TypeScript will error if you forget - the `Record<AppErrorCode, string>` type ensures all codes have messages.

## tRPC Client

The tRPC client (`trpc.ts`) is configured with:

- **`loggerLink`** - Logs requests/responses in development
- **`httpBatchLink`** - Batches requests, sends `Authorization: Bearer <token>` header

Authentication tokens are stored in localStorage and attached to every request automatically via `getStorage('auth_token')`.

Usage in components:

```typescript
import { trpc } from '@/lib/trpc'

// Queries
const { data } = trpc.user.getProfile.useQuery()

// Mutations
const mutation = trpc.auth.login.useMutation()
```

## Type-Safe Storage

The `useStorage` hook provides type-safe localStorage access with cross-tab sync:

```typescript
import { useStorage } from '@/lib/storage'

const [token, setToken, clearToken] = useStorage('auth_token')
```

For non-React contexts (e.g., tRPC client, QueryClient), use the standalone functions:

```typescript
import { getStorage, clearStorage } from '@/lib/storage'

const token = getStorage('auth_token') // Returns typed value or null
clearStorage('auth_token') // Removes from localStorage
```

### Adding New Storage Keys

Add the key and type to `StorageRegistry`:

```typescript
interface StorageRegistry {
  auth_token: string
  theme: 'light' | 'dark' // Add new keys here
}
```
