# SOP: tRPC Error Handling

This document explains how errors flow through the tRPC stack and how to debug issues.

## Architecture

```
Client Request
    ↓
loggerLink (logs in dev console)
    ↓
httpBatchLink
    ↓
Server: createContext (adds requestId)
    ↓
Procedure (throws TRPCError/AppError)
    ↓
Server: errorFormatter (shapes response)
    ↓
Server: onError (logs to stdout)
    ↓
Client: TRPCClientError
    ↓
Client: parseError utility
```

## Key Files

| File                                  | Purpose                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `packages/shared/src/errors.ts`       | **Single source of truth** for error codes            |
| `apps/server/src/lib/errors.ts`       | AppError class, tRPC code mapping, factories          |
| `apps/server/src/trpc/index.ts`       | Error formatter, request ID generation                |
| `apps/server/src/index.ts`            | onError logging in Express middleware                 |
| `apps/web/src/lib/errors.ts`          | parseError, getFieldError utilities, user messages    |
| `apps/web/src/lib/trpc.ts`            | loggerLink for dev console visibility                 |
| `apps/web/src/lib/query.ts`           | Global QueryClient error handlers, retry logic        |

> **Note:** Import paths like `@/lib/errors` use TypeScript path aliases configured in each app's `tsconfig.json`.

## Throwing Errors

### Using TRPCError (Standard)

```typescript
import { TRPCError } from '@trpc/server'

throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'User not found',
})
```

### Using AppError (Business Logic)

```typescript
import { authError, notFound, alreadyExists } from '@/lib/errors'

// Auth errors
throw authError('INVALID_CREDENTIALS', 'Invalid email or password')
throw authError('EMAIL_ALREADY_EXISTS', 'This email is taken')
throw authError('SESSION_EXPIRED', 'Please log in again')

// Resource errors
throw notFound('User', userId)  // → "User with id abc123 not found"
throw notFound('User')          // → "User not found"
throw alreadyExists('Account', 'user@example.com')
```

## Handling Errors (Client)

### In Mutations

```typescript
import { parseError } from '@/lib/errors'

const mutation = trpc.auth.login.useMutation({
  onError: (error) => {
    const parsed = parseError(error)
    setServerError(parsed.userMessage)  // User-facing message
    console.debug('Debug:', parsed.debugMessage, 'Request ID:', parsed.requestId)
  },
})
```

### In Queries

```typescript
const query = trpc.users.get.useQuery(
  { id: userId },
  {
    onError: (error) => {
      const parsed = parseError(error)
      // Use appCode for app-specific errors, code for tRPC errors
      if (parsed.appCode === 'NOT_FOUND' || parsed.code === 'NOT_FOUND') {
        navigate({ to: '/404' })
      }
    },
  }
)
```

### Form Validation Errors

Use the `getFieldError` helper for cleaner field error extraction:

```typescript
import { parseError, getFieldError } from '@/lib/errors'

const parsed = parseError(error)
const emailError = getFieldError(parsed, 'email')
if (emailError) {
  form.setError('email', { message: emailError })
}
```

Or access field errors directly:

```typescript
const parsed = parseError(error)
if (parsed.fieldErrors?.email) {
  form.setError('email', { message: parsed.fieldErrors.email[0] })
}
```

## Debugging Workflow

1. **Check browser console** - loggerLink shows all requests/responses in dev
2. **Note the request ID** - Visible in error response `data.requestId`
3. **Search server logs** - `grep "req_abc123" server.log`
4. **Full context in dev** - Input data and stack traces are included

## Error Response Shapes

### Development

```json
{
  "error": {
    "message": "Invalid email or password",
    "code": -32600,
    "data": {
      "code": "UNAUTHORIZED",
      "appCode": "INVALID_CREDENTIALS",
      "httpStatus": 401,
      "requestId": "a1b2c3d4_e5f6_7890_abcd_ef1234567890",
      "stack": "Error: Invalid email...\n    at login.ts:25:11...",
      "zodError": null
    }
  }
}
```

### Production

```json
{
  "error": {
    "message": "Invalid email or password",
    "code": -32600,
    "data": {
      "code": "UNAUTHORIZED",
      "appCode": "INVALID_CREDENTIALS",
      "httpStatus": 401,
      "requestId": "a1b2c3d4_e5f6_7890_abcd_ef1234567890"
    }
  }
}
```

### Error Code Fields

| Field     | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `code`    | tRPC error code (e.g., `UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`)             |
| `appCode` | App-specific code (e.g., `INVALID_CREDENTIALS`, `EMAIL_ALREADY_EXISTS`)     |

The `parseError()` utility uses `appCode` first for user message lookup, falling back to `code`. This ensures specific messages like "Invalid email or password." instead of generic "Please log in to continue."

### ParsedError Fields

| Field          | Purpose                                              |
| -------------- | ---------------------------------------------------- |
| `userMessage`  | Display to users in UI                               |
| `debugMessage` | Server's raw message - for logging/debugging only    |
| `code`         | tRPC error code                                      |
| `appCode`      | App-specific error code                              |
| `requestId`    | For correlating with server logs                     |
| `fieldErrors`  | Zod validation errors by field name                  |

## Adding New Error Codes

Adding a new error code requires changes in **3 places** (with 1 optional step). TypeScript will enforce this at compile time.

### Step 1: Add to shared package

**File:** `packages/shared/src/errors.ts`

```typescript
export const AppErrorCode = {
  // ... existing codes
  MY_NEW_ERROR: 'MY_NEW_ERROR',  // Add here
} as const
```

### Step 2: Map to tRPC code (server)

**File:** `apps/server/src/lib/errors.ts`

```typescript
const APP_CODE_TO_TRPC: Record<AppErrorCode, TRPCError['code']> = {
  // ... existing mappings
  MY_NEW_ERROR: 'BAD_REQUEST',  // Add mapping
}
```

TypeScript will fail until you add this mapping.

### Step 3: Add user message (client)

**File:** `apps/web/src/lib/errors.ts`

```typescript
const APP_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  // ... existing messages
  MY_NEW_ERROR: 'Something specific went wrong.',  // Add message
}
```

TypeScript will fail until you add this message.

### Step 4 (Optional): Create factory function

If the error code is used frequently, add a factory function:

```typescript
export function myNewError(details: string) {
  return new AppError({
    code: 'MY_NEW_ERROR',
    message: details,
  })
}
```

## Type Safety

Error codes are defined once in `packages/shared/src/errors.ts` and imported by both server and client. This ensures:

1. **Single source of truth** - Codes are defined once
2. **Compile-time enforcement** - Missing mappings or messages cause TypeScript errors
3. **IDE support** - Autocomplete for error codes works across the monorepo

## Global Error Handlers

The `QueryClient` in `apps/web/src/lib/query.ts` provides global error handling:

### Automatic Retry Logic

Queries automatically retry up to 3 times, **except** for auth errors:

```typescript
retry: (failureCount, error) => {
  if (error instanceof TRPCClientError) {
    const code = error.data?.code
    if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
      return false  // Don't retry auth errors
    }
  }
  return failureCount < 3
}
```

### Global Logging

All query and mutation errors are logged to the console with request IDs:

```typescript
queryCache: new QueryCache({
  onError: (error, query) => {
    const info = getErrorInfo(error)
    console.error('[Query Error]', query.queryKey, info)
  },
})
```

Use global handlers for logging and per-mutation handlers for UI feedback.

## Real-World Examples

These files demonstrate the error handling patterns in practice:

| File                                                            | Pattern Demonstrated                |
| --------------------------------------------------------------- | ----------------------------------- |
| `apps/server/src/domains/auth/procedures/login.ts`              | `authError('INVALID_CREDENTIALS')`  |
| `apps/server/src/domains/auth/procedures/register.ts`           | `authError('EMAIL_ALREADY_EXISTS')` |
| `apps/web/src/features/auth/pages/RegisterPage/index.tsx`       | `parseError()` in mutation handler  |

## Error Code Naming Conventions

When adding new error codes:

| Convention              | Example                   | Notes                                     |
| ----------------------- | ------------------------- | ----------------------------------------- |
| SCREAMING_SNAKE_CASE    | `EMAIL_ALREADY_EXISTS`    | Standard for constants                    |
| Domain prefix           | `AUTH_`, `USER_`, `BILLING_` | Groups related errors                   |
| Specific over generic   | `EMAIL_ALREADY_EXISTS`    | Not just `DUPLICATE` or `CONFLICT`        |
| Action-oriented         | `SESSION_EXPIRED`         | Describes what happened, not what to do   |

## Troubleshooting

### "Error message shows 'undefined'"

**Cause:** Using a field name that doesn't exist on `ParsedError`.

**Fix:** Use `userMessage` or `debugMessage`, not `message`:

```typescript
// Wrong
parsed.message

// Correct
parsed.userMessage    // For UI display
parsed.debugMessage   // For logging
```

### "TypeScript doesn't catch missing error code"

**Cause:** Not using `Record<AppErrorCode, ...>` type.

**Fix:** Ensure mappings use the exhaustive Record type:

```typescript
// This enforces all codes are present
const APP_CODE_TO_TRPC: Record<AppErrorCode, TRPCError['code']> = { ... }
```

### "Request ID is 'unknown' or undefined"

**Cause:** Error occurred before context creation.

**Fix:** Check that the error is reaching the `errorFormatter`. Errors thrown during context creation won't have a request ID.

### "Field errors not appearing"

**Cause:** Zod validation errors have a specific structure.

**Fix:** Ensure you're checking the correct path:

```typescript
const parsed = parseError(error)
// Use the helper
const fieldError = getFieldError(parsed, 'fieldName')
// Or access directly
parsed.fieldErrors?.fieldName?.[0]
```

## Principles

1. **Always include request ID** - Essential for log correlation
2. **Use AppError for business logic** - Not just HTTP codes
3. **Hide sensitive data in prod** - Input, stack traces
4. **Provide user-friendly messages** - Map codes to readable text
5. **Log on both sides** - Server for debugging, client for development
