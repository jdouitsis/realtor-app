# Shared Package (`@app/shared`)

When to use `@app/shared` for types and constants across server and client.

## When to Use Shared Package

Use `@app/shared` when you need to share **values** (not just types) between server and client:

- Database enum values that the client also needs to iterate over
- Constants used in both validation (server) and UI logic (client)
- Error codes with mappings on both sides

## When to Use tRPC Type Inference Instead

If you only need the **type** (not the actual values), prefer inferring from tRPC:

```typescript
import { type RouterOutput } from '@/lib/trpc'

type Client = RouterOutput['clients']['list'][number]
type ClientStatus = Client['status'] // 'invited' | 'active' | 'inactive'
```

This is cleaner when:
- You don't need to iterate over the values
- You don't need constants like defaults or labels
- The type is only used for typing variables/props

## Example: Client Status

We use `@app/shared/clients` because:

1. **Server needs values** for the database enum:
   ```typescript
   // apps/server/src/db/schema/clients.ts
   import { CLIENT_STATUSES } from '@app/shared/clients'
   export const clientStatusEnum = pgEnum('client_status', CLIENT_STATUSES)
   ```

2. **Client needs values** to iterate in UI:
   ```typescript
   // StatusFilter.tsx
   import { CLIENT_STATUSES } from '@app/shared/clients'

   {CLIENT_STATUSES.map((status) => (
     <Button key={status}>...</Button>
   ))}
   ```

3. **Type derived from values** = single source of truth:
   ```typescript
   // @app/shared/clients.ts
   export const CLIENT_STATUSES = ['invited', 'active', 'inactive'] as const
   export type ClientStatus = (typeof CLIENT_STATUSES)[number]
   ```

If we only needed the type, we'd infer it from tRPC. But since we need the array for iteration and the pgEnum, the shared package is the right choice.

## Example: Error Codes

We use `@app/shared/errors` because:

1. **Server throws errors** with these codes:
   ```typescript
   // apps/server/src/domains/auth/services/login.ts
   import { AppErrorCode } from '@app/shared/errors'

   throw new TRPCError({
     code: 'NOT_FOUND',
     message: AppErrorCode.USER_NOT_FOUND,
   })
   ```

2. **Client maps codes to user messages**:
   ```typescript
   // apps/web/src/lib/errors.ts
   import { type AppErrorCode } from '@app/shared/errors'

   const ERROR_MESSAGES: Record<AppErrorCode, string> = {
     INVALID_CREDENTIALS: 'Invalid email or password',
     USER_NOT_FOUND: 'No account found with this email',
     // ...
   }
   ```

3. **Type ensures exhaustive handling** - adding a new error code in the shared package will cause a compile error in the client until a user message is added.

## Adding New Shared Types

1. Create a file in `packages/shared/src/` (e.g., `clients.ts`)
2. Export constants with `as const` for type inference
3. Export the derived type
4. Add the export to `packages/shared/package.json`:
   ```json
   "exports": {
     "./clients": {
       "types": "./src/clients.ts",
       "import": "./src/clients.ts"
     }
   }
   ```
5. Update `packages/shared/README.md` with the new export
