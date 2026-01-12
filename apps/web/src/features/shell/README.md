# Shell Feature

The shell feature provides the authenticated layout structure including the sidebar, mobile navigation, and header components.

## Directory Structure

```
shell/
├── layouts/
│   └── AuthenticatedLayout.tsx  # Main layout wrapper for authenticated routes
├── components/
│   ├── Sidebar.tsx              # Collapsible desktop sidebar
│   └── MobileNav.tsx            # Mobile navigation menu (in sheet)
├── hooks/
│   └── useSidebarCollapsed.ts   # Sidebar collapse state with localStorage
├── config.ts                    # Menu items configuration
└── index.ts                     # Barrel exports
```

## Usage

The `AuthenticatedLayout` is used by the `/_authenticated` route:

```tsx
// routes/_authenticated/route.tsx
import { AuthenticatedLayout } from '@/features/shell'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})
```

## Adding Menu Items

Edit `config.ts` to add or modify navigation items:

```tsx
import { Calendar } from 'lucide-react'

export const MenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Events', icon: Calendar, to: '/events' },
  // Add new items here
]
```

Menu items appear in both the desktop sidebar and mobile navigation.

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│ Desktop (md+)                                   │
├────────┬────────────────────────────────────────┤
│        │ Header (empty, for future use)         │
│ Side-  ├────────────────────────────────────────┤
│ bar    │                                        │
│        │ Main Content (<Outlet />)              │
│ [C]    │                                        │
│        │                                        │
└────────┴────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Mobile (<md)                                    │
├─────────────────────────────────────────────────┤
│ [spacer]  Realtor App  [menu]  ← Header             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Main Content (<Outlet />)                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Sidebar Behavior

| State     | Width | Content              |
| --------- | ----- | -------------------- |
| Expanded  | 200px | Icon + label         |
| Collapsed | 64px  | Icon only + tooltips |

Collapse state persists to localStorage via the `sidebar_collapsed` key.

## Components

### AuthenticatedLayout

Main layout wrapper that renders:

- Desktop: Sidebar + toggle button + header + main content
- Mobile: Header with sheet menu + main content

### Sidebar

Collapsible sidebar with:

- Logo header ("Realtor App" / "C")
- Navigation items from `MenuItems`
- Smooth width transition (0.15s)

### MobileNav

Navigation menu rendered inside a Sheet component:

- All items from `MenuItems`
- Logout button at bottom
