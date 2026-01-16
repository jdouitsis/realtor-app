# Feature 03: Clients List Page

> **Epic:** [Client Management](overview.md)
> **Status:** Pending
> **Estimated Effort:** M

## Summary

Create the clients list page accessible at `/clients`. This page displays all of the realtor's clients in a table format with filters for status (invited/active/inactive). Each row shows the client's name, email, status badge, created date, and a quick action to view their profile.

## Prerequisites

- [ ] Feature 02: Clients Domain Backend must be complete

## User Stories

- As a realtor, I want to see all my clients in a list so that I can manage my client relationships
- As a realtor, I want to filter clients by status so that I can focus on specific groups (e.g., active deals only)
- As a realtor, I want to quickly navigate to a client's profile so that I can see their details

## Acceptance Criteria

- [ ] AC1: `/clients` route is accessible under the authenticated layout
- [ ] AC2: Page displays a table with columns: Name, Email, Status, Created, Actions
- [ ] AC3: Status filter allows selecting: All, Invited, Active, Inactive
- [ ] AC4: Filtering updates the URL search params (e.g., `/clients?status=active`)
- [ ] AC5: Clicking a row or "View" action navigates to `/clients/:id`
- [ ] AC6: Status is displayed as a colored badge (invited=yellow, active=green, inactive=gray)
- [ ] AC7: Empty state shows appropriate message when no clients exist
- [ ] AC8: Loading state shows skeleton or spinner while fetching
- [ ] AC9: Error state shows error message with retry option
- [ ] AC10: "Clients" nav item appears in the sidebar

## Technical Specification

### Data Model Changes

None - uses existing backend from Feature 02.

### API Changes

None - uses `clients.list` from Feature 02.

### UI Components

#### Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Clients                                    [+ Invite Client] │
├──────────────────────────────────────────────────────────────┤
│ Status: [All ▾] [Invited] [Active] [Inactive]                │
├──────────────────────────────────────────────────────────────┤
│ Name          │ Email              │ Status  │ Created │     │
│───────────────│────────────────────│─────────│─────────│─────│
│ John Smith    │ john@example.com   │ Active  │ Jan 10  │ → │
│ Jane Doe      │ jane@example.com   │ Invited │ Jan 12  │ → │
│ Bob Wilson    │ bob@example.com    │ Inactive│ Dec 15  │ → │
└──────────────────────────────────────────────────────────────┘
```

#### New Components to Create

**1. `ClientsTable`** - Table displaying client rows

```tsx
interface ClientsTableProps {
  clients: Client[]
  onRowClick: (id: string) => void
}
```

**2. `StatusBadge`** - Colored badge for status display

```tsx
interface StatusBadgeProps {
  status: 'invited' | 'active' | 'inactive'
}

// Colors:
// invited: bg-yellow-100 text-yellow-800
// active: bg-green-100 text-green-800
// inactive: bg-gray-100 text-gray-800
```

**3. `StatusFilter`** - Filter buttons/tabs for status

```tsx
interface StatusFilterProps {
  value: 'all' | 'invited' | 'active' | 'inactive'
  onChange: (status: 'all' | 'invited' | 'active' | 'inactive') => void
}
```

#### File Structure

```
apps/web/src/features/clients/
├── pages/
│   └── ClientsListPage/
│       ├── index.tsx                    # Page component
│       ├── components/
│       │   ├── ClientsTable.tsx         # Table component
│       │   ├── StatusBadge.tsx          # Status badge
│       │   └── StatusFilter.tsx         # Filter component
│       └── hooks/
│           └── useClientsQuery.ts       # TanStack Query hook
└── index.ts                             # Barrel export
```

### Route Configuration

Create `apps/web/src/routes/_authenticated/clients/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { ClientsListPage } from '@/features/clients'

const searchSchema = z.object({
  status: z.enum(['all', 'invited', 'active', 'inactive']).optional().catch('all'),
})

export const Route = createFileRoute('/_authenticated/clients/')({
  validateSearch: searchSchema,
  component: ClientsListPage,
})
```

### URL Search Params

The page uses search params for filter state:

- `/clients` - Shows all clients (status=all is default)
- `/clients?status=invited` - Shows only invited clients
- `/clients?status=active` - Shows only active clients
- `/clients?status=inactive` - Shows only inactive clients

Use TanStack Router's `useSearch` and `useNavigate` for managing search params:

```tsx
const { status } = Route.useSearch()
const navigate = useNavigate()

const handleStatusChange = (newStatus: string) => {
  navigate({
    search: (prev) => ({
      ...prev,
      status: newStatus === 'all' ? undefined : newStatus,
    }),
  })
}
```

### Sidebar Navigation Update

Add to `apps/web/src/features/shell/config.ts`:

```tsx
import { LayoutDashboard, Users } from 'lucide-react'

export const MenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Clients', icon: Users, to: '/clients' },
]
```

### Business Logic

**Query Hook:**
```tsx
function useClientsQuery(status?: 'invited' | 'active' | 'inactive') {
  return trpc.clients.list.useQuery(
    { status: status === 'all' ? undefined : status },
    {
      staleTime: 30_000, // 30 seconds
    }
  )
}
```

**Date Formatting:**
- Display created date in relative format for recent (e.g., "2 days ago")
- Display full date for older entries (e.g., "Jan 10, 2026")

## Edge Cases & Error Handling

| Scenario                           | Expected Behavior                                           |
| ---------------------------------- | ----------------------------------------------------------- |
| No clients exist                   | Show empty state: "No clients yet. Invite your first client!"|
| No clients match filter            | Show: "No [status] clients found"                           |
| API error                          | Show error message with "Try again" button                  |
| Invalid status in URL              | Default to 'all' (handled by Zod catch)                     |
| Loading state                      | Show skeleton rows or spinner                               |
| Very long name/email               | Truncate with ellipsis, show full on hover (title attr)     |

## Testing Requirements

- [ ] Component test: `ClientsTable` renders rows correctly
- [ ] Component test: `StatusBadge` shows correct colors
- [ ] Component test: `StatusFilter` calls onChange with correct value
- [ ] Integration test: Page loads and displays clients
- [ ] Integration test: Filter updates URL and refetches
- [ ] Integration test: Empty state displays when no clients
- [ ] Integration test: Row click navigates to profile

## Implementation Notes

1. **Use existing table patterns**: Check if there's an existing table pattern in the codebase. If not, use a simple `<table>` with Tailwind styling consistent with shadcn/ui.

2. **Badge component**: Consider creating a reusable `Badge` component in `@/components/ui/badge.tsx` if one doesn't exist. This can be used for status badges throughout the app.

3. **Query invalidation**: When a client is invited or status changes, the list query should be invalidated. This will be handled in Feature 05.

4. **Mobile responsiveness**: On mobile, consider hiding less important columns (Created date) or using a card layout instead of table.

5. **Invite button**: The "+ Invite Client" button should be visible but will be non-functional until Feature 05. Use `disabled` state or hide it entirely.

## Files to Create/Modify

| File                                                               | Action                              |
| ------------------------------------------------------------------ | ----------------------------------- |
| `apps/web/src/features/clients/pages/ClientsListPage/index.tsx`    | Create - main page component        |
| `apps/web/src/features/clients/pages/ClientsListPage/components/ClientsTable.tsx` | Create - table component   |
| `apps/web/src/features/clients/pages/ClientsListPage/components/StatusBadge.tsx` | Create - badge component    |
| `apps/web/src/features/clients/pages/ClientsListPage/components/StatusFilter.tsx` | Create - filter component  |
| `apps/web/src/features/clients/pages/ClientsListPage/hooks/useClientsQuery.ts` | Create - query hook         |
| `apps/web/src/features/clients/index.ts`                           | Create - barrel export              |
| `apps/web/src/routes/_authenticated/clients/index.tsx`             | Create - route file                 |
| `apps/web/src/features/shell/config.ts`                            | Modify - add Clients nav item       |
| `apps/web/src/components/ui/badge.tsx` (optional)                  | Create - reusable badge component   |

## Out of Scope

- Pagination (add if client count grows large)
- Sorting by column
- Search by name/email
- Bulk actions
- Export functionality
