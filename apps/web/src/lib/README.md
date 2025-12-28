# Lib

Core utilities and configurations for the web application.

## Files

| File                 | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `query.ts`           | TanStack Query client with global error handling  |
| `trpc.ts`            | tRPC client setup with React Query integration    |
| `errors.ts`          | Error parsing and user-friendly message mapping   |
| `storage.ts`         | Type-safe localStorage hook with cross-tab sync   |
| `router-context.ts`  | TanStack Router context type definitions          |
| `utils.ts`           | General utilities (`cn` for Tailwind class merge) |

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

When adding a new `AppErrorCode` in `@finance/shared/errors`:

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
- **`httpBatchLink`** - Batches requests, includes credentials for cookies

Usage in components:

```typescript
import { trpc } from '@/lib/trpc'

// Queries
const { data } = trpc.user.getProfile.useQuery()

// Mutations
const mutation = trpc.auth.login.useMutation()
```

## Type-Safe Storage

The `useStorage` hook provides type-safe localStorage access:

```typescript
import { useStorage } from '@/lib/storage'

const [user, setUser, clearUser] = useStorage('auth_user')
```

### Adding New Storage Keys

Add the key and type to `StorageRegistry`:

```typescript
interface StorageRegistry {
  auth_user: { id: string; email: string; name: string }
  theme: 'light' | 'dark'  // Add new keys here
}
```
