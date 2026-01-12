# SOP: Discriminated Unions

This document explains how to create type-safe discriminated unions using the `MapToUnionWithTypeFieldAdded` utility type. This pattern is useful for APIs that accept different payloads based on a `type` field.

## The Pattern

```typescript
import type { MapToUnionWithTypeFieldAdded } from '@app/shared/types'

// 1. Define a map of type keys to their payloads
type EventMap = {
  userCreated: { userId: string; email: string }
  orderPlaced: { orderId: string; amount: number }
  itemShipped: { orderId: string; trackingNumber: string }
}

// 2. Derive the type key union from the map
type EventType = keyof EventMap

// 3. Create the discriminated union with `type` field added
type Event = MapToUnionWithTypeFieldAdded<EventMap, EventType>

// Result:
// | { type: 'userCreated'; userId: string; email: string }
// | { type: 'orderPlaced'; orderId: string; amount: number }
// | { type: 'itemShipped'; orderId: string; trackingNumber: string }
```

## Key Files

| File                              | Purpose                                 |
| --------------------------------- | --------------------------------------- |
| `packages/shared/src/types.ts`    | `MapToUnionWithTypeFieldAdded` utility  |

## How It Works

The `MapToUnionWithTypeFieldAdded` utility type:

1. Takes a map type `T` where keys are type names and values are payloads
2. Takes an enum/union type `E` that must match the keys of `T`
3. Adds a `type` field to each payload, set to the corresponding key
4. Returns a union of all the augmented types

```typescript
export type MapToUnionWithTypeFieldAdded<T, E extends keyof T> = [E] extends [keyof T]
  ? { [K in keyof T]: T[K] & { type: K } }[keyof T]
  : never
```

## Usage with ts-pattern

The discriminated union works seamlessly with ts-pattern for exhaustive matching:

```typescript
import { match } from 'ts-pattern'

function handleEvent(event: Event) {
  return match(event)
    .with({ type: 'userCreated' }, (data) => {
      // data.userId and data.email are typed correctly
      console.log(`User ${data.userId} created with email ${data.email}`)
    })
    .with({ type: 'orderPlaced' }, (data) => {
      // data.orderId and data.amount are typed correctly
      console.log(`Order ${data.orderId} placed for $${data.amount}`)
    })
    .with({ type: 'itemShipped' }, (data) => {
      // data.orderId and data.trackingNumber are typed correctly
      console.log(`Order ${data.orderId} shipped: ${data.trackingNumber}`)
    })
    .exhaustive()
}
```

**Benefits:**
- No type casting required inside match handlers
- Adding a new type to the map without updating the match causes a compile error
- Full autocomplete for payload properties

## Adding a New Type

### Step 1: Add to the Map

```typescript
type EventMap = {
  userCreated: { userId: string; email: string }
  orderPlaced: { orderId: string; amount: number }
  itemShipped: { orderId: string; trackingNumber: string }
  refundIssued: { orderId: string; refundAmount: number }  // Add this
}
```

### Step 2: Update the Match Expression

```typescript
function handleEvent(event: Event) {
  return match(event)
    .with({ type: 'userCreated' }, (data) => { /* ... */ })
    .with({ type: 'orderPlaced' }, (data) => { /* ... */ })
    .with({ type: 'itemShipped' }, (data) => { /* ... */ })
    .with({ type: 'refundIssued' }, (data) => {  // Add this
      console.log(`Refund of $${data.refundAmount} issued for ${data.orderId}`)
    })
    .exhaustive()
}
```

If you forget Step 2, TypeScript will show an error at `.exhaustive()` because not all cases are handled.

## Real-World Example: Email Templates

See [sop-email-templates.md](./sop-email-templates.md) for a complete implementation.

```typescript
// apps/server/src/infra/email/render.tsx

type EmailTemplatePropsMap = {
  otp: OtpEmailProps
  magicLink: MagicLinkEmailProps
}

type EmailTemplateType = keyof EmailTemplatePropsMap

type EmailTemplateInput = MapToUnionWithTypeFieldAdded<
  EmailTemplatePropsMap,
  EmailTemplateType
>

// Usage:
const { html, text } = await renderEmail({
  type: 'otp',
  code: '123456',
  expiresInMinutes: 15,
})
```

## When to Use This Pattern

Use discriminated unions when:

- A function accepts different payloads based on a type/action/event
- You want exhaustive handling of all cases
- You need type-safe access to payload properties
- You want compile-time errors when new types are added but not handled

Examples:
- Event handlers (analytics, webhooks)
- API request/response types
- State machine actions
- Email/notification templates
- Form submission handlers

## Troubleshooting

### "Type 'X' is not assignable to parameter"

**Cause:** The map keys don't match the type union.

**Fix:** Ensure `EmailTemplateType = keyof EmailTemplatePropsMap` derives from the same map.

### ts-pattern `.exhaustive()` error

**Cause:** A type in the map is not handled in the match expression.

**Fix:** Add a `.with({ type: 'missingType' }, ...)` case for the missing type.

### Payload properties not typed correctly

**Cause:** Using the wrong type in the handler.

**Fix:** Let TypeScript infer the `data` parameter type from the `.with()` pattern:

```typescript
// Good - TypeScript infers data type from pattern
.with({ type: 'otp' }, (data) => { /* data.code is string */ })

// Bad - manually typing loses inference
.with({ type: 'otp' }, (data: EmailTemplateInput) => { /* data.code might not exist */ })
```
