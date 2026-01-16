# Decision: Route Not Found Error Handling

**Date:** 2026-01-16
**Status:** Accepted

## Context

The application needed to restrict certain routes (e.g., `/clients`) to specific user types (realtors only). When unauthorized users access these routes, they should see a 404 page rather than a redirect, to avoid revealing the existence of protected features.

TanStack Router provides multiple ways to handle not-found errors, each with different behavior:

1. `notFoundComponent` on individual routes
2. `defaultNotFoundComponent` on the router
3. `CatchNotFound` component wrapper
4. Throwing `notFound()` from `beforeLoad`, `loader`, or components

Understanding where to throw and where errors are caught is critical for predictable behavior.

## Decision

Use `notFound()` thrown from route `loader` functions, caught by `defaultNotFoundComponent` configured on the router.

### Implementation

**Router configuration** (`router.ts`) sets the global fallback:

```typescript
import { NotFoundPage } from '@/features/errors'

export const router = createRouter({
  routeTree,
  context: undefined! as RouterContext,
  defaultNotFoundComponent: NotFoundPage,
})
```

**Protected routes** throw `notFound()` in their `loader`:

```typescript
// routes/_authenticated/clients/route.tsx
export const Route = createFileRoute('/_authenticated/clients')({
  loader: ({ context }) => {
    if (!context.user.isRealtor) {
      throw notFound()
    }
  },
  component: () => <Outlet />,
})
```

### Where `notFound()` Can Be Thrown

| Location      | Caught By                                        | Use Case                          |
| ------------- | ------------------------------------------------ | --------------------------------- |
| `beforeLoad`  | Always `__root` notFoundComponent                | Not recommended for route guards  |
| `loader`      | Nearest `notFoundComponent` or router default    | **Recommended for route guards**  |
| Component     | `CatchNotFound` wrapper or router default        | Dynamic checks during render      |

### How Error Bubbling Works

When `notFound()` is thrown in a `loader`:

1. TanStack Router walks **up** the route tree looking for `notFoundComponent`
2. If none found on any route, uses `defaultNotFoundComponent` from router
3. The not-found component renders **in place of** the throwing route's component
4. Parent layouts (Outlets above the throwing route) remain rendered

```
__root (RootLayout)
  └── _authenticated (AuthenticatedLayout with sidebar)
        └── <Outlet /> ← NotFoundPage renders HERE
              └── clients (threw notFound in loader)
```

This means the 404 page renders **inside** the authenticated layout, preserving the sidebar and header.

### Full-Page 404 vs Layout-Preserved 404

| Desired Behavior           | Configuration                                      |
| -------------------------- | -------------------------------------------------- |
| 404 inside layout          | `defaultNotFoundComponent` on router (current)     |
| 404 replaces entire layout | `notFoundComponent` on `__root` route              |

## Alternatives Considered

### 1. Throw in `beforeLoad`

```typescript
beforeLoad: ({ context }) => {
  if (!context.user.isRealtor) {
    throw notFound()
  }
}
```

**Rejected:** Per TanStack Router documentation, throwing `notFound()` in `beforeLoad` **always** bubbles to `__root`, regardless of where `notFoundComponent` is configured. This is by design since `beforeLoad` runs before loaders, and parent layouts may not have loaded yet.

### 2. Throw in Component with `CatchNotFound` Wrapper

```typescript
// AuthenticatedLayout.tsx
<CatchNotFound fallback={() => <NotFoundPage />}>
  <Outlet />
</CatchNotFound>
```

**Rejected:** Works but requires wrapper in layout. The `loader` approach is cleaner and recommended by TanStack Router documentation.

### 3. Redirect to Dashboard Instead of 404

```typescript
if (!context.user.isRealtor) {
  throw redirect({ to: '/dashboard' })
}
```

**Rejected:** Reveals that the route exists but is protected. A 404 provides better security through obscurity for features that shouldn't be discoverable by unauthorized users.

### 4. `notFoundComponent` on Individual Routes

```typescript
export const Route = createFileRoute('/_authenticated/clients')({
  notFoundComponent: NotFoundPage,
  // ...
})
```

**Considered:** Valid for route-specific 404 pages. Using `defaultNotFoundComponent` on the router provides a consistent global fallback without repetition.

## Consequences

### Positive

- **Consistent 404 handling** - Single `defaultNotFoundComponent` handles all not-found errors
- **Layout preservation** - 404 renders inside authenticated layout, keeping navigation visible
- **Clean route files** - Just throw `notFound()` in loader, no component wrappers needed
- **Type-safe context access** - `loader` has access to `context.user` set by parent `beforeLoad`
- **Security** - Protected routes appear as non-existent to unauthorized users

### Negative

- **Can't use `beforeLoad`** - Must use `loader` for route guards that need `notFound()`
- **Full-page 404 requires config change** - Need to add `notFoundComponent` to `__root` if desired

### Files

**New:**
- `apps/web/src/features/errors/pages/NotFoundPage/index.tsx` - 404 page component
- `apps/web/src/features/errors/index.ts` - Barrel export

**Modified:**
- `apps/web/src/router.ts` - Added `defaultNotFoundComponent`
- `apps/web/src/routes/_authenticated/clients/route.tsx` - Throws `notFound()` in loader
