# @app/shared

Shared types and constants used by both `@app/server` and `@app/web`.

## Purpose

This package provides a single source of truth for types that must stay in sync between server and client. Using `Record<Type, string>` patterns ensures compile-time enforcement when new values are added.

## Exports

| Export Path              | Contents                       |
| ------------------------ | ------------------------------ |
| `@app/shared/errors` | `AppErrorCode` type and object |

## Adding a New Error Code

When you add a new error code, the build will fail in both apps until you update their respective mappings:

1. **Add the code** in `packages/shared/src/errors.ts`:

   ```typescript
   export const AppErrorCode = {
     // ... existing codes
     NEW_ERROR_CODE: 'NEW_ERROR_CODE',
   } as const
   ```

2. **Update the server** in `apps/server/src/lib/errors.ts`:

   - Add mapping to `APP_CODE_TO_TRPC` (maps to tRPC error code)

3. **Update the client** in `apps/web/src/lib/errors.ts`:

   - Add user-friendly message to `APP_ERROR_MESSAGES`

4. **Verify**: Run `pnpm typecheck` from root - both apps should pass.

## Why This Pattern?

Using `Record<AppErrorCode, string>` instead of `Record<string, string>` means TypeScript will error if any key from `AppErrorCode` is missing. This guarantees:

- Every error code has a tRPC mapping on the server
- Every error code has a user message on the client
- No orphaned or mistyped error codes
