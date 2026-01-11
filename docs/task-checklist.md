# Task Checklist

Review this checklist before completing any task. These rules ensure consistency across the codebase.

## TypeScript

- [ ] When creating type-safe unions with a `type` discriminator, use `MapToUnionWithTypeFieldAdded`:
  ```typescript
  import type { MapToUnionWithTypeFieldAdded } from '@concordpoint/shared/types'

  type EventMap = {
    userCreated: { userId: string; email: string }
    orderPlaced: { orderId: string; amount: number }
  }

  type EventType = keyof EventMap
  type Event = MapToUnionWithTypeFieldAdded<EventMap, EventType>
  // Result: { type: 'userCreated'; userId: string; email: string } | { type: 'orderPlaced'; ... }
  ```
  See [SOP: Discriminated Unions](./SOP/sop-discriminated-unions.md) for full pattern.
