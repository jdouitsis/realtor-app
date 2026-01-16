# Feature 02: Clients Domain Backend

> **Epic:** [Client Management](overview.md)
> **Status:** Pending
> **Estimated Effort:** L

## Summary

Create the `clients` domain with tRPC procedures for listing clients, getting a client by ID, inviting new clients, and updating client status. The invite procedure handles both user creation (when the email doesn't exist) and relationship creation, delegating the actual invitation logic to a service.

## Prerequisites

- [ ] Feature 01: Schema Migration must be complete

## User Stories

- As a realtor, I want to fetch my list of clients so that I can display them in the UI
- As a realtor, I want to view a specific client's details so that I can see their profile
- As a realtor, I want to invite a client by email so that they can access the platform
- As a realtor, I want to change a client's status so that I can manage active/inactive relationships

## Acceptance Criteria

- [ ] AC1: `clients.list` returns clients for the authenticated realtor with optional status filter
- [ ] AC2: `clients.getById` returns a single client's details (name, email, status, createdAt)
- [ ] AC3: `clients.getById` returns NOT_FOUND if client doesn't exist or doesn't belong to realtor
- [ ] AC4: `clients.invite` creates a new user if email doesn't exist (with `isRealtor: false`)
- [ ] AC5: `clients.invite` creates the `realtorClients` relationship with status `invited`
- [ ] AC6: `clients.invite` sends a magic link email to the client with redirect to `/forms`
- [ ] AC7: `clients.invite` returns ALREADY_EXISTS with clientId if realtor already has this client
- [ ] AC8: `clients.updateStatus` allows changing status between `active` and `inactive`
- [ ] AC9: `clients.updateStatus` returns NOT_FOUND if client doesn't belong to realtor
- [ ] AC10: Magic link consumption updates client status from `invited` to `active`
- [ ] AC11: All procedures require authentication (use `protectedProcedure`)

## Technical Specification

### Data Model Changes

None - uses existing `realtorClients` and `users` tables from Feature 01.

### API Changes

#### `clients.list`

```typescript
// Input
const listInput = z.object({
  status: z.enum(['invited', 'active', 'inactive']).optional(),
})

// Output
const clientOutput = z.object({
  id: z.string(),           // realtorClients.id
  clientId: z.string(),     // users.id (the client's user ID)
  name: z.string(),
  email: z.string(),
  status: z.enum(['invited', 'active', 'inactive']),
  createdAt: z.date(),
})

const listOutput = z.array(clientOutput)
```

**Implementation:**
```typescript
export const list = protectedProcedure
  .input(listInput)
  .output(listOutput)
  .query(async ({ input, ctx: { db, user } }) => {
    const conditions = [
      eq(realtorClients.realtorId, user.id),
      isNull(realtorClients.deletedAt),
    ]

    if (input.status) {
      conditions.push(eq(realtorClients.status, input.status))
    }

    const results = await db
      .select({
        id: realtorClients.id,
        clientId: users.id,
        name: users.name,
        email: users.email,
        status: realtorClients.status,
        createdAt: realtorClients.createdAt,
      })
      .from(realtorClients)
      .innerJoin(users, eq(realtorClients.clientId, users.id))
      .where(and(...conditions))
      .orderBy(desc(realtorClients.createdAt))

    return results
  })
```

#### `clients.getById`

```typescript
// Input
const getByIdInput = z.object({
  id: z.string().uuid(),  // realtorClients.id
})

// Output - same as clientOutput above
```

**Implementation:**
- Query `realtorClients` joined with `users`
- Filter by `realtorClients.id` AND `realtorId = user.id`
- Throw `notFound('Client', id)` if not found

#### `clients.invite`

```typescript
// Input
const inviteInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  redirectUrl: z.string(),  // Built with router.buildLocation() on frontend for type safety
})

// Output
const inviteOutput = z.object({
  clientId: z.string(),     // The realtorClients.id
})
```

**Implementation (delegate to service):**
```typescript
export const invite = protectedProcedure
  .input(inviteInput)
  .output(inviteOutput)
  .mutation(async ({ input, ctx: { db, user, req } }) => {
    return clientInviteService.invite(db, {
      realtorId: user.id,
      email: input.email,
      name: input.name,
      redirectUrl: input.redirectUrl,
      ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0],
    })
  })
```

#### `clients.updateStatus`

```typescript
// Input
const updateStatusInput = z.object({
  id: z.string().uuid(),    // realtorClients.id
  status: z.enum(['active', 'inactive']),  // Note: can't set to 'invited'
})

// Output
const updateStatusOutput = z.object({
  success: z.boolean(),
})
```

**Implementation:**
- Verify the `realtorClients` record exists and belongs to `user.id`
- Update status
- Throw `notFound('Client', id)` if not found

### Service: `clientInviteService`

Create `apps/server/src/domains/clients/services/invite.ts`:

```typescript
export interface InviteClientOptions {
  realtorId: string
  email: string
  name: string
  redirectUrl: string
  ipAddress?: string
}

export interface InviteClientResult {
  clientId: string      // realtorClients.id
}

export const clientInviteService = {
  async invite(db: Database, options: InviteClientOptions): Promise<InviteClientResult> {
    const { realtorId, email, name, redirectUrl, ipAddress } = options

    // 1. Check if relationship already exists
    const [existing] = await db
      .select({ id: realtorClients.id })
      .from(realtorClients)
      .innerJoin(users, eq(realtorClients.clientId, users.id))
      .where(and(
        eq(realtorClients.realtorId, realtorId),
        eq(users.email, email),
        isNull(realtorClients.deletedAt)
      ))
      .limit(1)

    if (existing) {
      throw alreadyExists('Client', existing.id)  // Include ID in error
    }

    // 2. Find or create user
    let [clientUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!clientUser) {
      [clientUser] = await db
        .insert(users)
        .values({
          email,
          name,
          isRealtor: false,
        })
        .returning()
    }

    // 3. Create realtor-client relationship
    const [relationship] = await db
      .insert(realtorClients)
      .values({
        realtorId,
        clientId: clientUser.id,
        status: 'invited',
      })
      .returning()

    // 4. Send magic link with redirect
    const { magicUrl } = await magicLinkService.create(db, {
      userId: clientUser.id,
      redirectUrl,
      createdBy: realtorId,
      ipAddress,
    })
    await sendMagicLinkEmail(clientUser.email, magicUrl)

    return {
      clientId: relationship.id,
    }
  },
}
```

### Magic Link Activation Hook

Modify `apps/server/src/domains/auth/procedures/verifyMagicLink.ts` to activate client status when magic link is consumed:

```typescript
// After successfully verifying and consuming the magic link:
// If the user is a client of the magic link creator, activate them
if (magicLink.createdBy) {
  await db
    .update(realtorClients)
    .set({ status: 'active' })
    .where(and(
      eq(realtorClients.realtorId, magicLink.createdBy),
      eq(realtorClients.clientId, user.id),
      eq(realtorClients.status, 'invited')
    ))
}
```

### UI Components

None - backend only.

### Business Logic

**Invite Flow:**
1. Check if realtor already has a relationship with this email → error with client ID
2. Find user by email OR create new user with `isRealtor: false`
3. Create `realtorClients` record with status `invited`
4. Generate magic link with provided `redirectUrl` and `createdBy: realtorId`
5. Send magic link email
6. Return client ID

**Status Transitions:**
- `invited` → `active` (automatic on magic link consumption)
- `active` → `inactive` (manual via `updateStatus`)
- `inactive` → `active` (manual via `updateStatus`)
- Cannot manually set status to `invited`

## Edge Cases & Error Handling

| Scenario                                         | Expected Behavior                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| Realtor invites email already in their list      | Return ALREADY_EXISTS with `clientId` in error message              |
| Realtor invites existing user (different realtor)| Create new relationship, send magic link, return success            |
| Client already exists, not linked to realtor     | Create relationship only (no new user), send magic link             |
| getById with wrong realtor's client              | Return NOT_FOUND (don't leak that client exists for another)        |
| updateStatus on non-existent client              | Return NOT_FOUND                                                    |
| updateStatus trying to set `invited`             | Schema validation fails (only `active`/`inactive` allowed)          |
| Soft-deleted client invited again                | Should work - creates new relationship (old one has `deletedAt`)    |

## Testing Requirements

- [ ] Unit test: `clientInviteService.invite` with new user
- [ ] Unit test: `clientInviteService.invite` with existing user
- [ ] Unit test: `clientInviteService.invite` with duplicate relationship
- [ ] Integration test: `clients.list` returns only current realtor's clients
- [ ] Integration test: `clients.list` filters by status correctly
- [ ] Integration test: `clients.getById` returns correct client
- [ ] Integration test: `clients.getById` returns NOT_FOUND for other realtor's client
- [ ] Integration test: `clients.invite` creates user and relationship
- [ ] Integration test: `clients.invite` returns ALREADY_EXISTS for duplicate
- [ ] Integration test: `clients.updateStatus` changes status
- [ ] Integration test: Magic link consumption activates client status

## Implementation Notes

1. **Error handling for duplicates**: The `alreadyExists` error should include the client ID so the frontend can navigate to the profile. Parse it from the error message or extend the error type.

2. **Magic link service reuse**: Import `magicLinkService` and `sendMagicLinkEmail` from `@server/domains/auth/services/magicLink`

3. **Protected procedures**: All procedures use `protectedProcedure` since only authenticated realtors should access client management

4. **Soft delete awareness**: Always filter by `isNull(realtorClients.deletedAt)` in queries

5. **Router registration**: Remember to add `clientsRouter` to `apps/server/src/routers/index.ts`

## Files to Create/Modify

| File                                                      | Action                                       |
| --------------------------------------------------------- | -------------------------------------------- |
| `apps/server/src/domains/clients/procedures/list.ts`      | Create - list clients procedure              |
| `apps/server/src/domains/clients/procedures/getById.ts`   | Create - get client by ID procedure          |
| `apps/server/src/domains/clients/procedures/invite.ts`    | Create - invite client procedure             |
| `apps/server/src/domains/clients/procedures/updateStatus.ts` | Create - update status procedure          |
| `apps/server/src/domains/clients/services/invite.ts`      | Create - invite service logic                |
| `apps/server/src/domains/clients/router.ts`               | Create - domain router                       |
| `apps/server/src/routers/index.ts`                        | Modify - register clients router             |
| `apps/server/src/domains/auth/procedures/verifyMagicLink.ts` | Modify - add client activation logic      |
| `packages/shared/src/errors.ts`                           | Potentially add CLIENT_ALREADY_EXISTS code   |

## Out of Scope

- Pagination for `clients.list` (add if needed later)
- Sorting options for `clients.list`
- Batch invite functionality
- Re-sending invitation email (can be added later)
- Client notes or metadata
