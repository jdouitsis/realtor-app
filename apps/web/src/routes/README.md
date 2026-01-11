# Routes

File-based routing using TanStack Router. Routes are automatically generated from the file structure.

## Route Structure

```
routes/
├── __root.tsx              # Root layout (providers, global UI)
├── index.tsx               # / → LandingPage (redirects to /dashboard if authenticated)
├── _public/                # Public section (accessible to all, some redirect if authed)
│   ├── route.tsx           # Layout with NavBar
│   ├── login/
│   │   ├── index.tsx       # /login - with ?redirect param
│   │   └── magic.tsx       # /login/magic - magic link verification
│   ├── register.tsx        # /register
│   └── public/             # Public content pages (redirect to auth versions if logged in)
│       ├── events/
│       │   ├── index.tsx   # /public/events - public events listing
│       │   └── $eventId.tsx# /public/events/:id - public event detail
│       └── newsletter.tsx  # /public/newsletter - public newsletter page
└── _authenticated/         # Protected section (authenticated users only)
    ├── route.tsx           # Layout with Sidebar + top bar (desktop) / mobile menu
    ├── dashboard.tsx       # /dashboard
    ├── profile.tsx         # /profile
    ├── otp.tsx             # /otp - step-up verification
    ├── events/
    │   ├── index.tsx       # /events - authenticated events listing
    │   └── $eventId.tsx    # /events/:id - authenticated event detail
    └── newsletter.tsx      # /newsletter - authenticated newsletter page
```

## Authentication Flow

### Index Route (`/`)

The index route handles users based on their authentication state:

- **Authenticated** → Redirects to `/dashboard`
- **Unauthenticated** → Shows `LandingPage` component

```typescript
beforeLoad: ({ context }) => {
  if (context.auth.isAuthenticated) {
    throw redirect({ to: '/dashboard' })
  }
},
component: LandingPage,
```

### Public Routes (`_public/`)

Public routes are accessible to unauthenticated users. Login and register pages redirect authenticated users to `/dashboard`.

| Route               | Path                 | Description                                  |
| ------------------- | -------------------- | -------------------------------------------- |
| `login`             | `/login`             | Login form with ?redirect support            |
| `login/magic`       | `/login/magic`       | Magic link verification                      |
| `register`          | `/register`          | Registration form                            |
| `public/events`     | `/public/events`     | Public events listing (redirects if authed)  |
| `public/events/$id` | `/public/events/:id` | Public event detail (redirects if authed)    |
| `public/newsletter` | `/public/newsletter` | Public newsletter page (redirects if authed) |

### Authenticated Routes (`_authenticated/`)

Protected routes require authentication. If an unauthenticated user tries to access these routes, they're redirected to `/login` with a `?redirect` param to return after login.

| Route        | Path          | Description                   |
| ------------ | ------------- | ----------------------------- |
| `dashboard`  | `/dashboard`  | Main dashboard view           |
| `profile`    | `/profile`    | User profile with tabs        |
| `otp`        | `/otp`        | Step-up OTP verification      |
| `events`     | `/events`     | Authenticated events listing  |
| `events/$id` | `/events/:id` | Authenticated event detail    |
| `newsletter` | `/newsletter` | Authenticated newsletter page |

### Authenticated Layout

The authenticated layout is provided by the `shell` feature. See [`features/shell/README.md`](../features/shell/README.md) for details.

- **Desktop (md+)**: Left sidebar with collapsible navigation + sticky top bar
- **Mobile (<md)**: Top header with hamburger menu (opens from left)

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
