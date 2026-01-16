# SOP: Cursor-Based Pagination

This document explains how to implement cursor-based pagination for list endpoints in the application.

## Why Cursor-Based?

Cursor-based pagination is preferred over offset-based for several reasons:

| Aspect          | Offset (LIMIT/OFFSET)              | Cursor-Based                          |
| --------------- | ---------------------------------- | ------------------------------------- |
| Data changes    | Can skip/duplicate items           | Consistent results                    |
| Performance     | Slower on large offsets            | Constant time                         |
| Use case        | Random page access                 | Sequential "load more"                |

Use cursor-based pagination for all list endpoints unless random page access is specifically required.

## Implementation Pattern

### Server Side (tRPC Procedure)

```typescript
import { z } from 'zod'
import { protectedProcedure } from '@server/trpc'
import { and, desc, eq, lt } from 'drizzle-orm'

const listItemsInput = z.object({
  cursor: z.string().uuid().optional(), // Last item's ID
  limit: z.number().int().min(1).max(100).default(20),
  // Add filters here
})

const listItemsOutput = z.object({
  items: z.array(itemSchema),
  nextCursor: z.string().uuid().nullable(),
  hasMore: z.boolean(),
})

export const listItems = protectedProcedure
  .input(listItemsInput)
  .output(listItemsOutput)
  .query(async ({ input, ctx: { db } }) => {
    const { cursor, limit } = input

    // Build conditions array
    const conditions = [
      // Base filters go here
    ]

    // Add cursor condition if provided
    if (cursor) {
      const [cursorRecord] = await db
        .select({ createdAt: items.createdAt })
        .from(items)
        .where(eq(items.id, cursor))
        .limit(1)

      if (cursorRecord) {
        conditions.push(lt(items.createdAt, cursorRecord.createdAt))
      }
    }

    // Query limit + 1 to check if more exist
    const results = await db
      .select()
      .from(items)
      .where(and(...conditions))
      .orderBy(desc(items.createdAt))
      .limit(limit + 1)

    // Determine if there are more pages
    const hasMore = results.length > limit
    const pageItems = hasMore ? results.slice(0, limit) : results
    const nextCursor = hasMore ? pageItems[pageItems.length - 1].id : null

    return {
      items: pageItems,
      nextCursor,
      hasMore,
    }
  })
```

### Key Points

1. **Cursor is the last item's ID** - Simple and unique
2. **Query limit + 1** - Avoids a separate count query
3. **Cursor lookup** - Get the sort value from the cursor record to build the comparison
4. **Null nextCursor** - Indicates no more pages

### Client Side (TanStack Query)

```tsx
import { trpc } from '@/lib/trpc'

function ItemList() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.items.list.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }
  )

  // Flatten pages into single array
  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}

      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  )
}
```

### Key Points

1. **`useInfiniteQuery`** - TanStack Query's infinite scroll hook
2. **`getNextPageParam`** - Extracts cursor from last page
3. **Return `undefined`** when no more pages (not `null`)
4. **`flatMap`** - Combines all pages into single array

## Sorting with Cursors

When sorting by a non-unique field (like name), include secondary sort for consistency:

```typescript
// Sort by name with createdAt as tiebreaker
const results = await db
  .select()
  .from(items)
  .where(and(...conditions))
  .orderBy(asc(items.name), desc(items.createdAt))
  .limit(limit + 1)

// Cursor condition becomes more complex
if (cursor && cursorRecord) {
  conditions.push(
    or(
      gt(items.name, cursorRecord.name),
      and(
        eq(items.name, cursorRecord.name),
        lt(items.createdAt, cursorRecord.createdAt)
      )
    )!
  )
}
```

## Filters and Search

Filters are applied before cursor:

```typescript
const listItemsInput = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.enum(['all', 'pending', 'active']).default('all'),
  search: z.string().optional(),
})

// In procedure:
if (input.status !== 'all') {
  conditions.push(eq(items.status, input.status))
}

if (input.search) {
  conditions.push(ilike(items.name, `%${input.search}%`))
}

// Cursor condition comes AFTER filters
if (cursor) {
  // ... cursor logic
}
```

## URL State Sync

Store filters in URL for shareability:

```tsx
// Route definition
const searchSchema = z.object({
  status: z.enum(['all', 'pending', 'active']).optional().default('all'),
  search: z.string().optional(),
})

export const Route = createFileRoute('/items')({
  validateSearch: searchSchema,
  component: ItemList,
})

// In component
const { status, search } = Route.useSearch()
const navigate = useNavigate()

// Update URL when filter changes
const handleStatusChange = (newStatus: string) => {
  navigate({
    search: (prev) => ({ ...prev, status: newStatus }),
    replace: true,
  })
}
```

## Testing

```typescript
describe('listItems', () => {
  it('returns first page without cursor', async () => {
    // Seed 25 items
    const result = await client.items.list({ limit: 20 })

    expect(result.items).toHaveLength(20)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBeDefined()
  })

  it('returns next page with cursor', async () => {
    const page1 = await client.items.list({ limit: 20 })
    const page2 = await client.items.list({ limit: 20, cursor: page1.nextCursor })

    expect(page2.items).toHaveLength(5)
    expect(page2.hasMore).toBe(false)
    expect(page2.nextCursor).toBeNull()

    // No overlap
    const page1Ids = page1.items.map((i) => i.id)
    const page2Ids = page2.items.map((i) => i.id)
    expect(page1Ids).not.toEqual(expect.arrayContaining(page2Ids))
  })

  it('applies filters correctly', async () => {
    const result = await client.items.list({ status: 'pending' })
    expect(result.items.every((i) => i.status === 'pending')).toBe(true)
  })
})
```

## Checklist

When implementing a new paginated list:

- [ ] Define input schema with `cursor`, `limit`, and filters
- [ ] Define output schema with `items`, `nextCursor`, `hasMore`
- [ ] Build conditions array starting with base filters
- [ ] Add cursor lookup and condition after filters
- [ ] Query with `limit + 1`
- [ ] Determine `hasMore` and slice results
- [ ] Use `useInfiniteQuery` on client
- [ ] Implement `getNextPageParam`
- [ ] Store filters in URL search params
- [ ] Add "Load More" button with loading state
- [ ] Write tests for pagination edge cases

## References

- [TanStack Query: Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
- [Why Cursor Pagination](https://www.sitepoint.com/paginating-real-time-data-cursor-based-pagination/)
