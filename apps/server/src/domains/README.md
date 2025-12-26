# Domains

This directory contains domain-specific tRPC routers organized by feature area.

## Structure

```
domains/
├── {domain}/
│   ├── procedures/
│   │   ├── {procedureName}.ts   # Individual procedure with its schemas
│   │   └── ...
│   ├── services/                # Optional: domain business logic
│   │   └── {serviceName}.ts
│   ├── lib/                     # Optional: domain utilities
│   │   └── {utilName}.ts
│   └── router.ts                # Combines procedures into domain router
└── README.md
```

## Directory Purposes

| Directory     | Purpose                                          | Dependencies                    |
| ------------- | ------------------------------------------------ | ------------------------------- |
| `procedures/` | tRPC endpoints - thin layer calling services     | Services, lib, tRPC context     |
| `services/`   | Business logic operating on domain entities      | Database, domain models         |
| `lib/`        | Utilities that support the domain                | Framework objects (req/res)     |

### `services/` vs `lib/`

**Services** contain core business logic:
- Work with the database and domain entities
- Testable without HTTP (mock the db, get results)
- Answer "what does this domain do?"

```typescript
// services/session.ts - business logic
export const sessionService = {
  async create(db: Database, userId: string): Promise<string> { ... },
  async validate(db: Database, token: string): Promise<User | null> { ... },
}
```

**Lib** contains supporting utilities:
- Often deal with HTTP/framework concerns (Request, Response)
- Transport mechanisms, formatters, helpers
- Answer "how does this domain interface with the outside world?"

```typescript
// lib/cookies.ts - HTTP transport for session tokens
export function setSessionCookie(res: Response, token: string): void { ... }
export function getSessionToken(req: Request): string | null { ... }
```

**When to use each:**
- Need to query/mutate domain data? → `services/`
- Need to interact with HTTP, format responses, parse requests? → `lib/`
- Small domain with simple logic? → Skip both, put logic in procedures

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
