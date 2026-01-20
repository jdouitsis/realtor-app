# Decision: Adopt Linear-Style Design System

**Date:** 2026-01-18
**Status:** Accepted

## Context

The application needed a comprehensive component library revamp to provide:

1. A cohesive visual identity across all UI elements
2. Modern aesthetic that feels polished and professional
3. Consistent design tokens for maintainability
4. Dark mode support with appropriate contrast

Linear's design system was chosen as inspiration due to its clean, minimal aesthetic with excellent typography and subtle use of gradients.

## Decision

Adopt a **Linear-inspired design system** with the following characteristics:

### Color Palette

**CSS Variables (HSL format):**

| Token           | Light Mode     | Dark Mode      | Usage                    |
| --------------- | -------------- | -------------- | ------------------------ |
| `--background`  | `0 0% 100%`    | `0 0% 2%`      | Page background          |
| `--primary`     | `250 100% 60%` | `250 100% 65%` | Vibrant purple-blue      |
| `--surface-1`   | `0 0% 99%`     | `0 0% 4%`      | First elevation layer    |
| `--surface-2`   | `0 0% 97%`     | `0 0% 6%`      | Second elevation layer   |
| `--surface-3`   | `0 0% 95%`     | `0 0% 8%`      | Third elevation layer    |
| `--border`      | `240 5.9% 90%` | `0 0% 12%`     | Subtle borders           |

### Typography

- **Font Family:** Inter (Google Fonts, weights 400/500/600)
- **Letter Spacing:** `-0.02em` for headings (`tracking-tighter`)
- **Font Sizes:** Added `text-2xs` (0.625rem) for micro labels

### Design Tokens

- **Border Radius:** 6px (0.375rem) — tighter than typical 8px
- **Transitions:** 150ms duration standard across interactions
- **Shadows:** Minimal — prefer subtle borders over shadows

### Primary Button Gradient

```css
background-image: linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)));
```

Where `--gradient-start: 250 100% 65%` and `--gradient-end: 270 100% 55%`.

### Component Architecture

**Base components** in `apps/web/src/components/ui/`:
- All shadcn/ui primitives restyled with Linear aesthetic
- Exported via barrel file (`index.ts`)

**Composed components** in `apps/web/src/components/composed/`:
- `DataTable` — TanStack Table wrapper with sorting/filtering
- `StatCard` — Metric display with trend indicator
- `EmptyState` — Illustrated placeholder for empty data
- `DatePicker` — Calendar + Popover composition
- `Combobox` — Searchable select (Command + Popover)
- `FileUpload` — Drag/drop with preview and progress

### Page-Level Patterns

Established patterns from the `/clients` and `/clients/$id/*` pages that should be followed across the application.

#### Page Headers

```tsx
<h1 className="text-lg font-semibold tracking-tight">Page Title</h1>
<p className="text-sm text-muted-foreground">Descriptive subtitle</p>
```

#### Section Headers

```tsx
<h3 className="text-sm font-medium text-muted-foreground mb-3">Section Title</h3>
```

#### Subtle Borders

Use 50% opacity borders for a softer appearance:

```tsx
// Container with dividers
<div className="rounded-lg border border-border/50 divide-y divide-border/50">
  {/* rows */}
</div>

// Table headers and rows
<tr className="border-b border-border/50 bg-muted/30">
```

#### Hover States

Soft background change on interactive rows:

```tsx
<div className="hover:bg-muted/30 transition-colors">
```

#### Icon Styling

Standard icon sizing with thinner stroke:

```tsx
<Icon className="h-4 w-4" strokeWidth={1.5} />
```

#### Colorful Icon Backgrounds

Semantic colors with 10% opacity background:

| Color   | Background           | Text              | Usage                    |
| ------- | -------------------- | ----------------- | ------------------------ |
| Blue    | `bg-blue-500/10`     | `text-blue-500`   | Email, links             |
| Emerald | `bg-emerald-500/10`  | `text-emerald-500`| Success, active status   |
| Amber   | `bg-amber-500/10`    | `text-amber-500`  | Pending, invited status  |
| Violet  | `bg-violet-500/10`   | `text-violet-500` | User, profile            |
| Pink    | `bg-pink-500/10`     | `text-pink-500`   | Relationships            |
| Orange  | `bg-orange-500/10`   | `text-orange-500` | Preferences              |
| Zinc    | `bg-zinc-500/10`     | `text-zinc-500`   | Inactive, muted          |

#### Status Filter Chips

Color-coded pill buttons with checkbox indicators for multi-select filters:

```tsx
// Selected state
className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30"

// Unselected state
className="bg-transparent border-border/60 text-muted-foreground"
```

#### Tab Navigation

Underline indicator pattern for navigation tabs:

```tsx
<Link className={cn(
  'relative px-3 py-2.5 text-sm font-medium transition-colors',
  'hover:text-foreground',
  isActive ? 'text-foreground' : 'text-muted-foreground'
)}>
  <Icon className="h-4 w-4" strokeWidth={1.5} />
  {label}
  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
</Link>
```

#### Breadcrumb Navigation

Simple slash-separated breadcrumbs:

```tsx
<nav className="flex items-center gap-2 text-sm">
  <Link className="text-muted-foreground hover:text-foreground transition-colors">
    Parent
  </Link>
  <span className="text-muted-foreground/50">/</span>
  <span className="text-foreground font-medium truncate">Current</span>
</nav>
```

#### Empty & Error States

Centered layout with icon in rounded container:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-full bg-muted/50 p-4 mb-4">
    <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
  </div>
  <h2 className="text-lg font-semibold tracking-tight mb-1">Title</h2>
  <p className="text-sm text-muted-foreground max-w-xs">Description</p>
</div>
```

For error states, use `bg-destructive/10` and `text-destructive`.

#### Skeleton Loading

Match the structure of actual content:

```tsx
<div className="rounded-lg border border-border/50 overflow-hidden">
  <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
    <Skeleton className="h-4 w-24" />
  </div>
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  ))}
</div>
```

#### Detail Rows

Two-line layout with icon, label, and value:

```tsx
<div className="flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
  <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
    <Icon className="h-4 w-4" strokeWidth={1.5} />
  </span>
  <div className="flex-1 min-w-0">
    <span className="block text-xs text-muted-foreground">{label}</span>
    <p className="text-sm font-medium truncate">{value}</p>
  </div>
</div>
```

## Alternatives Considered

### Material Design

- Well-documented and widely adopted
- **Rejected:** Heavy visual weight, opinionated shadows, doesn't match desired aesthetic

### Tailwind UI Components

- High-quality, production-ready
- **Rejected:** Requires paid license, less customization freedom

### Custom from Scratch

- Complete control over every detail
- **Rejected:** Time-intensive, maintenance burden

### shadcn/ui (as-is)

- Already using the base primitives
- **Rejected:** Default styling lacks cohesive identity, needed customization

## Consequences

### Benefits

1. **Cohesive Identity:** Consistent look across all pages and components
2. **Dark Mode First:** Colors designed for dark mode as primary, light mode secondary
3. **Performance:** Inter font with display swap, minimal CSS
4. **Developer Experience:** Composable components, clear patterns
5. **Accessibility:** High contrast ratios maintained, focus states visible

### Trade-offs

1. **Departure from Defaults:** Custom styling may diverge from future shadcn/ui updates
2. **Learning Curve:** Team needs to understand design tokens and patterns
3. **Breaking Changes:** Existing pages needed updates to match new aesthetic

### Migration Notes

Pages updated with `tracking-tighter` on major headings:
- `LandingPage`
- `DashboardPage`
- `ClientsListPage`
- `NotFoundPage`
- `LoginForm`
- `RegisterForm`
- `OtpVerificationForm`

## References

- [Linear Design](https://linear.app/design) — Inspiration source
- [shadcn/ui](https://ui.shadcn.com/) — Base component primitives
- [TanStack Table](https://tanstack.com/table) — Data table implementation
