# Decision: Use `@server/*` Path Alias for Server Package

**Date:** 2025-12-26
**Status:** Accepted

## Context

When the web app imports types from the server package:

```typescript
// apps/web/src/lib/trpc.ts
import type { AppRouter } from '@app/server/trpc'
```

TypeScript follows the import chain into server source files. Both packages used `@/*` as their path alias:

- Web: `@/*` → `apps/web/src/*`
- Server: `@/*` → `apps/server/src/*`

When web's TypeScript encountered `@/lib/errors` in a server file, it resolved using **web's** tsconfig, causing the path to incorrectly point to `apps/web/src/lib/errors` instead of `apps/server/src/lib/errors`.

This resulted in confusing type errors:

```
error TS2305: Module '"@/lib/errors"' has no exported member 'authError'.
```

## Decision

Use a unique path alias `@server/*` for the server package:

**Server tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@server/*": ["./src/*"]
    }
  }
}
```

**Web tsconfig.app.json** (teaches web how to resolve server paths):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@server/*": ["../server/src/*"]
    }
  }
}
```

## Alternatives Considered

### 1. Relative Imports in Server

```typescript
import { authError } from '../../../lib/errors'
```

**Rejected:** Works but produces ugly deep relative paths that are hard to read and refactor.

### 2. Pre-built Declaration Files

Export `.d.ts` files from server instead of source files. Web would typecheck against pre-built types.

**Rejected:** Loses real-time type safety in the IDE. Changes to server code wouldn't be reflected until a build runs.

### 3. TypeScript Project References

Configure server as a composite project and reference it from web.

**Rejected:** Doesn't solve the path alias conflict. TypeScript still uses the referencing project's path configuration.

## Consequences

### Positive

- Real-time type safety preserved in IDE
- Clear visual distinction between web imports (`@/`) and server imports (`@server/`)
- No build step required for type checking
- Web can correctly resolve server paths when following type imports

### Negative

- Must add `@server/*` to web's tsconfig (one-time setup)
- Server uses a different convention than web (minor inconsistency)

## Related Changes

- Changed web's typecheck from `tsc -b` to `tsc -p tsconfig.app.json --noEmit` (build mode doesn't use paths correctly for cross-package resolution)
