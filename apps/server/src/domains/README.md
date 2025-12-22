# Domains

This directory contains domain-specific tRPC routers organized by feature area.

## Structure

```
domains/
├── {domain}/
│   ├── procedures/
│   │   ├── {procedureName}.ts   # Individual procedure with its schemas
│   │   └── ...
│   └── router.ts                # Combines procedures into domain router
└── README.md
```

## Adding a New Domain

### 1. Create the domain directory

```
domains/
└── {newDomain}/
    ├── procedures/
    └── router.ts
```

### 2. Create procedures

Each procedure file contains:
- Input/output Zod schemas
- The procedure implementation

```typescript
// domains/{domain}/procedures/{name}.ts
import { z } from 'zod'
import { publicProcedure } from '../../../trpc'

export const myInput = z.object({
  // input schema
})

export const myOutput = z.object({
  // output schema
})

export const myProcedure = publicProcedure
  .input(myInput)
  .output(myOutput)
  .query(async ({ input }) => {
    // implementation
  })
```

### 3. Create the domain router

```typescript
// domains/{domain}/router.ts
import { router } from '../../trpc'
import { myProcedure } from './procedures/myProcedure'

export const myDomainRouter = router({
  myProcedure,
})
```

### 4. Register in the app router

```typescript
// routers/index.ts
import { router } from '../trpc'
import { myDomainRouter } from '../domains/{domain}/router'

export const appRouter = router({
  myDomain: myDomainRouter,
})
```

## Conventions

- **One procedure per file** - Keeps files focused and testable
- **Co-located schemas** - Input/output schemas live with their procedure
- **Flat procedures directory** - No nested subdirectories within procedures
- **Domain router exports** - Each domain has a single `router.ts` that combines its procedures
