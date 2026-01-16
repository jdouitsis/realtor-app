# Feature 04: Client Profile Page

> **Epic:** [Client Management](overview.md)
> **Status:** Complete
> **Estimated Effort:** M

## Summary

Create the client profile page accessible at `/clients/:id`. This page displays a client's details (name, email, status) and allows the realtor to change the client's status between active and inactive. The design is intentionally simple, showing only essential information.

## Prerequisites

- [ ] Feature 02: Clients Domain Backend must be complete
- [ ] Feature 03: Clients List Page (for navigation, though can be built in parallel)

## User Stories

- As a realtor, I want to view a client's profile so that I can see their contact information
- As a realtor, I want to change a client's status so that I can mark them as inactive when we're done working together
- As a realtor, I want to re-activate an inactive client so that I can work with them again

## Acceptance Criteria

- [x] AC1: `/clients/:id` route is accessible under the authenticated layout
- [x] AC2: Page displays client's name, email, and status
- [x] AC3: Status is shown with a colored badge (same as list page)
- [x] AC4: "Change Status" button allows toggling between active/inactive
- [x] AC5: Status change shows loading state during mutation
- [x] AC6: Status change updates the UI optimistically
- [x] AC7: "Back to Clients" link navigates to `/clients`
- [x] AC8: 404 page displays if client doesn't exist or doesn't belong to realtor
- [x] AC9: Loading state shows while fetching
- [x] AC10: Cannot change status of "invited" clients (button disabled)

## Technical Specification

### Data Model Changes

None - uses existing backend from Feature 02.

### API Changes

None - uses `clients.getById` and `clients.updateStatus` from Feature 02.

### UI Components

#### Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Clients                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Client Profile                                         │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  Name:   John Smith                                    │  │
│  │  Email:  john@example.com                              │  │
│  │  Status: [Active ●]                                    │  │
│  │                                                        │  │
│  │  Member since: January 10, 2026                        │  │
│  │                                                        │  │
│  │  ─────────────────────────────────────────────────     │  │
│  │                                                        │  │
│  │  [ Mark as Inactive ]                                  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### New Components to Create

**1. `ClientProfileCard`** - Main card displaying client info

```tsx
interface ClientProfileCardProps {
  client: {
    id: string
    clientId: string
    name: string
    email: string
    status: 'invited' | 'active' | 'inactive'
    createdAt: Date
  }
  onStatusChange: (newStatus: 'active' | 'inactive') => void
  isUpdating: boolean
}
```

**2. `StatusChangeButton`** - Button to toggle status

```tsx
interface StatusChangeButtonProps {
  currentStatus: 'invited' | 'active' | 'inactive'
  onToggle: () => void
  isLoading: boolean
}

// Logic:
// - If invited: disabled (can't manually change)
// - If active: shows "Mark as Inactive"
// - If inactive: shows "Mark as Active"
```

#### File Structure

```
apps/web/src/features/clients/
├── pages/
│   ├── ClientsListPage/
│   │   └── ...
│   └── ClientProfilePage/
│       ├── index.tsx                    # Page component
│       ├── components/
│       │   ├── ClientProfileCard.tsx    # Main profile card
│       │   └── StatusChangeButton.tsx   # Status toggle button
│       └── hooks/
│           ├── useClientQuery.ts        # Get client query
│           └── useUpdateStatus.ts       # Update status mutation
└── index.ts                             # Update barrel export
```

### Route Configuration

Create `apps/web/src/routes/_authenticated/clients/$id.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

import { ClientProfilePage } from '@/features/clients'

export const Route = createFileRoute('/_authenticated/clients/$id')({
  component: ClientProfilePage,
})
```

### Query & Mutation Hooks

**useClientQuery:**
```tsx
function useClientQuery(id: string) {
  return trpc.clients.getById.useQuery(
    { id },
    {
      staleTime: 30_000,
      // Handle 404 gracefully
      retry: (failureCount, error) => {
        if (error.data?.code === 'NOT_FOUND') return false
        return failureCount < 3
      },
    }
  )
}
```

**useUpdateStatus:**
```tsx
function useUpdateStatus() {
  const utils = trpc.useUtils()

  return trpc.clients.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await utils.clients.getById.cancel({ id })

      // Snapshot previous value
      const previous = utils.clients.getById.getData({ id })

      // Optimistically update
      utils.clients.getById.setData({ id }, (old) =>
        old ? { ...old, status } : old
      )

      return { previous }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previous) {
        utils.clients.getById.setData({ id }, context.previous)
      }
    },
    onSettled: (_, __, { id }) => {
      // Invalidate to ensure consistency
      utils.clients.getById.invalidate({ id })
      utils.clients.list.invalidate()
    },
  })
}
```

### Business Logic

**Status Toggle Logic:**
```typescript
const getNextStatus = (current: 'active' | 'inactive'): 'active' | 'inactive' => {
  return current === 'active' ? 'inactive' : 'active'
}

const getButtonLabel = (status: 'invited' | 'active' | 'inactive'): string => {
  switch (status) {
    case 'invited':
      return 'Awaiting Response'  // Disabled state
    case 'active':
      return 'Mark as Inactive'
    case 'inactive':
      return 'Mark as Active'
  }
}
```

**Date Formatting:**
- "Member since: January 10, 2026" - full date format for profile

## Edge Cases & Error Handling

| Scenario                              | Expected Behavior                                              |
| ------------------------------------- | -------------------------------------------------------------- |
| Client not found (404)                | Show "Client not found" page with link back to clients list    |
| Client belongs to different realtor   | Same as not found (don't leak existence)                       |
| Status update fails                   | Rollback optimistic update, show error toast                   |
| Invited client                        | Disable status change button, show "Awaiting Response"         |
| Loading state                         | Show skeleton card                                             |
| Invalid UUID in URL                   | Show 404 page                                                  |
| Network error while loading           | Show error with retry button                                   |

## Testing Requirements

- [ ] Component test: `ClientProfileCard` renders all fields correctly
- [ ] Component test: `StatusChangeButton` disabled for invited status
- [ ] Component test: `StatusChangeButton` shows correct label per status
- [ ] Integration test: Page loads client data
- [ ] Integration test: Status change mutation works
- [ ] Integration test: Optimistic update shows immediately
- [ ] Integration test: 404 handling for invalid ID
- [ ] Integration test: Back link navigates correctly

## Implementation Notes

1. **Reuse StatusBadge**: Import `StatusBadge` from the list page components or promote it to feature-level shared component.

2. **Route param access**: Use `Route.useParams()` to get the `id` param:
   ```tsx
   const { id } = Route.useParams()
   ```

3. **404 handling**: TanStack Router supports `notFound()` function or you can check query error state and render a custom 404 component.

4. **Optimistic updates**: The mutation hook includes optimistic update logic. Make sure to handle the loading/error states in the UI.

5. **Card styling**: Use the existing `Card`, `CardHeader`, `CardContent` components from shadcn/ui if available.

6. **Toast notifications**: Consider adding a toast for successful status updates. Check if there's an existing toast system (sonner, react-hot-toast, etc.).

## Files to Create/Modify

| File                                                                       | Action                               |
| -------------------------------------------------------------------------- | ------------------------------------ |
| `apps/web/src/features/clients/pages/ClientProfilePage/index.tsx`          | Create - main page component         |
| `apps/web/src/features/clients/pages/ClientProfilePage/components/ClientProfileCard.tsx` | Create - profile card     |
| `apps/web/src/features/clients/pages/ClientProfilePage/components/StatusChangeButton.tsx` | Create - status button   |
| `apps/web/src/features/clients/pages/ClientProfilePage/hooks/useClientQuery.ts` | Create - get client query       |
| `apps/web/src/features/clients/pages/ClientProfilePage/hooks/useUpdateStatus.ts` | Create - status mutation       |
| `apps/web/src/features/clients/index.ts`                                   | Modify - add ClientProfilePage export|
| `apps/web/src/routes/_authenticated/clients/$id.tsx`                       | Create - route file                  |
| `apps/web/src/features/clients/components/StatusBadge.tsx`                 | Move - promote to feature-level (optional) |

## Out of Scope

- Editing client name/email (clients manage their own profile)
- Activity history or timeline
- Notes section
- Associated properties or deals
- Re-send invitation functionality
- Delete client functionality
