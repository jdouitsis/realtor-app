# Task Checklist

Review this checklist before completing any task. These rules ensure consistency across the codebase.

## TypeScript

### Use the `ms` library for time durations instead of raw millisecond calculations:

```typescript
import ms from "ms";

// Good
const oneWeek = ms("1 week");
const fiveMinutes = ms("5 minutes");
const twoHours = ms("2h");

// Bad
const oneWeek = 7 * 24 * 60 * 60 * 1000;
const fiveMinutes = 5 * 60 * 1000;
```

### When creating type-safe unions with a `type` discriminator, use `MapToUnionWithTypeFieldAdded`:

```typescript
import type { MapToUnionWithTypeFieldAdded } from "@concordpoint/shared/types";

type EventMap = {
  userCreated: { userId: string; email: string };
  orderPlaced: { orderId: string; amount: number };
};

type EventType = keyof EventMap;
type Event = MapToUnionWithTypeFieldAdded<EventMap, EventType>;
// Result: { type: 'userCreated'; userId: string; email: string } | { type: 'orderPlaced'; ... }
```

See [SOP: Discriminated Unions](./SOP/sop-discriminated-unions.md) for full pattern.
