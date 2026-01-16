# Feature 05: Invite Client Flow

> **Epic:** [Client Management](overview.md)
> **Status:** Complete
> **Estimated Effort:** M

## Summary

Implement the invite client flow with a modal dialog triggered from the clients list page. The form collects email and name, calls the `clients.invite` mutation, and handles both success (navigate to new client) and duplicate scenarios (show message with link to existing client).

## Prerequisites

- [ ] Feature 02: Clients Domain Backend must be complete
- [ ] Feature 03: Clients List Page must be complete (for the trigger button)

## User Stories

- As a realtor, I want to invite a client by entering their email and name so that they can access the platform
- As a realtor, I want to be informed if I'm trying to invite someone already in my client list so that I don't create duplicates
- As a realtor, I want to navigate to the newly invited client's profile so that I can verify the invitation was sent

## Acceptance Criteria

- [x] AC1: "+ Invite Client" button on clients list page opens a modal dialog
- [x] AC2: Form validates email format and requires name (min 1 character)
- [x] AC3: Submit button shows loading state during mutation
- [ ] AC4: On success, modal closes and navigates to `/clients/:id` (new client) _(blocked: Feature 04 required)_
- [x] AC5: On success, show toast: "Invitation sent to {email}"
- [x] AC6: On duplicate (ALREADY_EXISTS), show inline message with "View Profile" link
- [ ] AC7: On duplicate, clicking "View Profile" closes modal and navigates to existing client _(blocked: Feature 04 required)_
- [x] AC8: Form clears when modal is closed and reopened
- [x] AC9: Client list invalidates and refetches after successful invite
- [x] AC10: Escape key or clicking outside closes the modal

## Technical Specification

### Data Model Changes

None - uses existing backend from Feature 02.

### API Changes

None - uses `clients.invite` from Feature 02.

### UI Components

#### Modal Flow

**Step 1: Initial Form**
```
┌──────────────────────────────────────────────┐
│ Invite Client                            [×] │
├──────────────────────────────────────────────┤
│                                              │
│  Send a magic link invitation to your        │
│  client so they can access the platform.     │
│                                              │
│  Email                                       │
│  ┌────────────────────────────────────────┐  │
│  │ client@example.com                     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Name                                        │
│  ┌────────────────────────────────────────┐  │
│  │ John Smith                             │  │
│  └────────────────────────────────────────┘  │
│                                              │
│                          [Cancel] [Invite]   │
└──────────────────────────────────────────────┘
```

**Step 2: Duplicate Error State**
```
┌──────────────────────────────────────────────┐
│ Invite Client                            [×] │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ ⚠ This client is already in your list │  │
│  │                                        │  │
│  │ john@example.com is already one of     │  │
│  │ your clients.                          │  │
│  │                                        │  │
│  │              [View Profile]            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Email                                       │
│  ┌────────────────────────────────────────┐  │
│  │ john@example.com                       │  │
│  └────────────────────────────────────────┘  │
│  ...                                         │
│                                              │
│                          [Cancel] [Invite]   │
└──────────────────────────────────────────────┘
```

#### New Components to Create

**1. `InviteClientDialog`** - The modal container

```tsx
interface InviteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**2. `InviteClientForm`** - Form content inside the modal

```tsx
interface InviteClientFormProps {
  onSuccess: (clientId: string) => void
  onCancel: () => void
}

// Form schema (using Zod)
const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(1, 'Name is required'),
})
```

**3. `DuplicateClientAlert`** - Alert shown when client exists

```tsx
interface DuplicateClientAlertProps {
  email: string
  clientId: string
  onViewProfile: () => void
}
```

#### File Structure

```
apps/web/src/features/clients/
├── pages/
│   ├── ClientsListPage/
│   │   ├── index.tsx                         # Update to include dialog
│   │   ├── components/
│   │   │   ├── ...
│   │   │   ├── InviteClientDialog.tsx        # Modal container
│   │   │   ├── InviteClientForm.tsx          # Form component
│   │   │   └── DuplicateClientAlert.tsx      # Duplicate error alert
│   │   └── hooks/
│   │       ├── ...
│   │       └── useInviteClient.ts            # Invite mutation hook
│   └── ClientProfilePage/
│       └── ...
└── index.ts
```

### Form Implementation

**Using react-hook-form + zod:**

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { router } from '@/router'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(1, 'Name is required'),
})

type FormData = z.infer<typeof schema>

function InviteClientForm({ onSuccess, onCancel }: InviteClientFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  })

  const invite = useInviteClient()
  const [duplicate, setDuplicate] = useState<{ email: string; clientId: string } | null>(null)

  const onSubmit = async (data: FormData) => {
    setDuplicate(null)
    try {
      // Build type-safe redirect URL per routing best practices
      const { href: redirectUrl } = router.buildLocation({ to: '/forms' })

      const result = await invite.mutateAsync({
        ...data,
        redirectUrl,
      })
      onSuccess(result.clientId)
    } catch (error) {
      if (isAlreadyExistsError(error)) {
        const clientId = parseClientIdFromError(error)
        setDuplicate({ email: data.email, clientId })
      }
    }
  }

  // ... form JSX
}
```

**Note:** Using `router.buildLocation()` ensures the redirect URL is type-safe. TypeScript will error if the route path doesn't exist. See [Routing Best Practices](../../../best-practices/routing.md).

### Mutation Hook

```tsx
function useInviteClient() {
  const utils = trpc.useUtils()

  return trpc.clients.invite.useMutation({
    onSuccess: () => {
      // Invalidate the list so it refetches
      utils.clients.list.invalidate()
    },
  })
}
```

### Error Parsing

The ALREADY_EXISTS error includes the client ID in the message. Parse it out:

```tsx
function isAlreadyExistsError(error: unknown): boolean {
  return (
    error instanceof TRPCClientError &&
    error.data?.code === 'ALREADY_EXISTS'
  )
}

function parseClientIdFromError(error: TRPCClientError): string {
  // Error message format: 'Client "abc-123-uuid" already exists'
  // Extract the UUID from the message
  const match = error.message.match(/"([^"]+)"/)
  return match?.[1] ?? ''
}
```

**Note:** A cleaner approach would be to return structured error data from the backend. Consider adding `clientId` to the error's `cause` or extending the error format.

### Toast Integration

Check if there's an existing toast system. If not, consider adding `sonner`:

```tsx
import { toast } from 'sonner'

// On success
toast.success(`Invitation sent to ${email}`)
```

If no toast system exists, this can be a simple inline success message before closing the modal.

### Business Logic

**Dialog State Machine:**
1. **Closed** → Button click → **Open (Form)**
2. **Open (Form)** → Submit → **Open (Loading)**
3. **Open (Loading)** → Success → **Closed** + Navigate + Toast
4. **Open (Loading)** → Duplicate → **Open (Duplicate Alert)**
5. **Open (Duplicate Alert)** → "View Profile" → **Closed** + Navigate
6. **Open (*)** → Cancel/Escape/Click outside → **Closed**

**Form Reset:**
When the dialog closes, reset the form state including any duplicate error:

```tsx
const handleOpenChange = (open: boolean) => {
  if (!open) {
    form.reset()
    setDuplicate(null)
  }
  onOpenChange(open)
}
```

## Edge Cases & Error Handling

| Scenario                                  | Expected Behavior                                          |
| ----------------------------------------- | ---------------------------------------------------------- |
| Invalid email format                      | Show validation error below email field                    |
| Empty name                                | Show validation error below name field                     |
| Network error during submit               | Show generic error, allow retry                            |
| Client already exists in realtor's list   | Show duplicate alert with "View Profile" button            |
| User exists but not in this realtor's list| Success - creates relationship and sends invite            |
| Submit while already submitting           | Button disabled, prevent double submission                 |
| Close modal during loading                | Cancel the visual state (mutation still completes)         |
| Very long email/name                      | Form should handle gracefully, consider max length         |

## Testing Requirements

- [ ] Component test: `InviteClientForm` validates email format
- [ ] Component test: `InviteClientForm` requires name
- [ ] Component test: `InviteClientForm` shows loading state on submit
- [ ] Component test: `DuplicateClientAlert` shows email and has button
- [ ] Integration test: Successful invite closes dialog, navigates, shows toast
- [ ] Integration test: Duplicate error shows alert with view profile link
- [ ] Integration test: Form resets when dialog closes
- [ ] Integration test: List refetches after successful invite

## Implementation Notes

1. **Dialog controlled state**: The dialog should be controlled from the parent `ClientsListPage`:
   ```tsx
   const [isInviteOpen, setIsInviteOpen] = useState(false)
   ```

2. **Navigation after success**: Use TanStack Router's `useNavigate`:
   ```tsx
   const navigate = useNavigate()
   navigate({ to: '/clients/$id', params: { id: clientId } })
   ```

3. **Type-safe redirect URL**: Build the redirect URL using `router.buildLocation()` for type safety:
   ```tsx
   const { href: redirectUrl } = router.buildLocation({ to: '/forms' })
   ```
   This ensures TypeScript will catch invalid route paths at compile time.

4. **Form components**: Use the existing form components from `@/components/ui/form.tsx` which integrates with react-hook-form.

5. **Accessibility**: The Dialog component from shadcn/ui handles most accessibility concerns (focus trap, escape key, etc.).

6. **Error ID parsing**: The current approach parses the client ID from the error message. A future improvement would be to include structured metadata in the error response.

## Files to Create/Modify

| File                                                                         | Action                                  |
| ---------------------------------------------------------------------------- | --------------------------------------- |
| `apps/web/src/features/clients/pages/ClientsListPage/index.tsx`              | Modify - add dialog trigger and state   |
| `apps/web/src/features/clients/pages/ClientsListPage/components/InviteClientDialog.tsx` | Create - modal container     |
| `apps/web/src/features/clients/pages/ClientsListPage/components/InviteClientForm.tsx` | Create - form component        |
| `apps/web/src/features/clients/pages/ClientsListPage/components/DuplicateClientAlert.tsx` | Create - duplicate alert   |
| `apps/web/src/features/clients/pages/ClientsListPage/hooks/useInviteClient.ts` | Create - invite mutation hook        |

## Out of Scope

- Bulk invite (multiple emails at once)
- CSV import
- Re-send invitation for existing invited clients
- Invite confirmation email to the realtor
- Custom invitation message
