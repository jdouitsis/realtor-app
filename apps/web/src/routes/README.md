# Routes

File-based routing using TanStack Router. Routes are automatically generated from the file structure.

## Route Structure

```
routes/
├── __root.tsx              # Root layout (providers, global UI)
├── index.tsx               # / → redirects based on auth state
├── _public/                # Public section (unauthenticated users only)
│   ├── route.tsx           # Layout with auth redirect guard
│   ├── landing.tsx         # /landing - marketing page
│   ├── login.tsx           # /login - with ?redirect param
│   └── register.tsx        # /register
└── _authenticated/         # Protected section (authenticated users only)
    ├── route.tsx           # Layout with auth guard
    └── dashboard.tsx       # /dashboard
```

## Authentication Flow

### Index Route (`/`)

The index route redirects users based on their authentication state:

- **Authenticated** → `/dashboard`
- **Unauthenticated** → `/landing`

```typescript
beforeLoad: ({ context }) => {
  if (context.auth.isAuthenticated) {
    throw redirect({ to: '/dashboard' })
  } else {
    throw redirect({ to: '/landing' })
  }
}
```

### Public Routes (`_public/`)

Public routes are for unauthenticated users. If an authenticated user tries to access these routes, they're redirected to `/dashboard`.

| Route      | Path        | Description                       |
| ---------- | ----------- | --------------------------------- |
| `landing`  | `/landing`  | Marketing page for new visitors   |
| `login`    | `/login`    | Login form with ?redirect support |
| `register` | `/register` | Registration form                 |

### Authenticated Routes (`_authenticated/`)

Protected routes require authentication. If an unauthenticated user tries to access these routes, they're redirected to `/login` with a `?redirect` param to return after login.

| Route       | Path         | Description         |
| ----------- | ------------ | ------------------- |
| `dashboard` | `/dashboard` | Main dashboard view |

## Pathless Layout Routes

TanStack Router uses `_` prefix for pathless layout routes:

- `_public/route.tsx` → Creates `/_public` layout (no URL segment)
- `_authenticated/route.tsx` → Creates `/_authenticated` layout (no URL segment)

Children of these layouts inherit the route path without the layout prefix:

```
_public/landing.tsx → /landing (not /_public/landing)
_authenticated/dashboard.tsx → /dashboard (not /_authenticated/dashboard)
```

## Adding New Routes

### Adding a Public Route

1. Create `_public/newpage.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { NewPage } from '@/features/public'

export const Route = createFileRoute('/_public/newpage')({
  component: NewPage,
})
```

2. The route will be accessible at `/newpage` and inherit the public layout guard.

### Adding an Authenticated Route

1. Create `_authenticated/newpage.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { NewPage } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/newpage')({
  component: NewPage,
})
```

2. The route will be accessible at `/newpage` and require authentication.

## Route Guards

Route guards use `beforeLoad` to check conditions before rendering:

```typescript
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})
```

The `context.auth` object is injected via the router context in `App.tsx`.

## Search Params

Routes can validate search params using Zod schemas:

```typescript
import { z } from 'zod/v4'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_public/login')({
  validateSearch: searchSchema,
  component: LoginPage,
})
```

Access search params in components via `Route.useSearch()`.
