# Design System

A Linear-inspired design system built on shadcn/ui primitives with custom styling for a clean, minimal, and professional aesthetic.

## Table of Contents

- [Design Principles](#design-principles)
- [Colors](#colors)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Page Patterns](#page-patterns)
- [Responsive Design](#responsive-design)

---

## Design Principles

1. **Minimal & Clean** — Reduce visual noise, let content breathe
2. **Dark Mode First** — Design for dark mode as primary, light mode secondary
3. **Subtle Interactions** — Soft hover states, smooth 150ms transitions
4. **Consistent Iconography** — Lucide icons at `h-4 w-4` with `strokeWidth={1.5}`
5. **Semantic Colors** — Use color to convey meaning, not decoration

---

## Colors

### Base Palette

| Token          | Light Mode     | Dark Mode      | Usage                  |
| -------------- | -------------- | -------------- | ---------------------- |
| `--background` | `0 0% 100%`    | `0 0% 2%`      | Page background        |
| `--foreground` | `0 0% 9%`      | `0 0% 98%`     | Primary text           |
| `--muted`      | `0 0% 96%`     | `0 0% 15%`     | Muted backgrounds      |
| `--border`     | `240 5.9% 90%` | `0 0% 12%`     | Borders and dividers   |
| `--primary`    | `250 100% 60%` | `250 100% 65%` | Primary actions        |

### Semantic Icon Colors

Use these combinations for icons with colored backgrounds:

| Purpose      | Background           | Text                | Example Usage          |
| ------------ | -------------------- | ------------------- | ---------------------- |
| Email/Links  | `bg-blue-500/10`     | `text-blue-500`     | Email fields, URLs     |
| Success      | `bg-emerald-500/10`  | `text-emerald-500`  | Active status, deals   |
| Warning      | `bg-amber-500/10`    | `text-amber-500`    | Pending, invited       |
| User/Profile | `bg-violet-500/10`   | `text-violet-500`   | Nickname, user info    |
| Family       | `bg-pink-500/10`     | `text-pink-500`     | Relationships          |
| Calendar     | `bg-amber-500/10`    | `text-amber-500`    | Dates, schedules       |
| Preferences  | `bg-orange-500/10`   | `text-orange-500`   | Settings, preferences  |
| Food         | `bg-rose-500/10`     | `text-rose-500`     | Food preferences       |
| Children     | `bg-sky-500/10`      | `text-sky-500`      | Family members         |
| Inactive     | `bg-zinc-500/10`     | `text-zinc-500`     | Disabled, muted        |
| Error        | `bg-destructive/10`  | `text-destructive`  | Errors, warnings       |

### Status Badge Colors

| Status   | Background              | Text                 | Border                   |
| -------- | ----------------------- | -------------------- | ------------------------ |
| Active   | `bg-emerald-500/10`     | `text-emerald-500`   | `border-emerald-500/20`  |
| Invited  | `bg-amber-500/10`       | `text-amber-500`     | `border-amber-500/20`    |
| Inactive | `bg-zinc-500/10`        | `text-zinc-400`      | `border-zinc-500/20`     |

---

## Typography

### Font

- **Family:** Inter (Google Fonts)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold)

### Headings

```tsx
// Page title
<h1 className="text-lg font-semibold tracking-tight">Page Title</h1>

// Page subtitle
<p className="text-sm text-muted-foreground">Descriptive subtitle</p>

// Section header
<h3 className="text-sm font-medium text-muted-foreground mb-3">Section Title</h3>
```

### Body Text

```tsx
// Primary text
<p className="text-sm font-medium">Primary content</p>

// Secondary/muted text
<p className="text-sm text-muted-foreground">Secondary content</p>

// Label text
<span className="text-xs text-muted-foreground">Label</span>

// Placeholder text
<p className="text-sm text-muted-foreground italic">Not set</p>
```

---

## Spacing & Layout

### Container Spacing

```tsx
// Page content
<div className="space-y-6">

// Section content
<div className="space-y-4">

// Tight grouping
<div className="space-y-2">
```

### Borders

Use 50% opacity for softer appearance:

```tsx
// Container with border
<div className="rounded-lg border border-border/50">

// Container with dividers
<div className="rounded-lg border border-border/50 divide-y divide-border/50">

// Table row borders
<tr className="border-b border-border/50">
```

### Border Radius

- Default: `rounded-lg` (8px)
- Pills/badges: `rounded-full`
- Icon containers: `rounded-lg` or `rounded-full`

---

## Components

### Icons

Always use Lucide icons with consistent sizing:

```tsx
// Standard size
<Icon className="h-4 w-4" strokeWidth={1.5} />

// Large (empty states)
<Icon className="h-6 w-6" strokeWidth={1.5} />

// Button icons
<Icon className="h-4 w-4" strokeWidth={1.5} />
```

### Icon with Colored Background

```tsx
<span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
  <Mail className="h-4 w-4" strokeWidth={1.5} />
</span>
```

### Buttons

```tsx
// Primary action
<Button size="sm">
  <Icon className="h-4 w-4" strokeWidth={1.5} />
  Action
</Button>

// Secondary/outline
<Button variant="outline" size="sm">
  <Icon className="h-4 w-4" strokeWidth={1.5} />
  Action
</Button>

// Ghost button
<Button variant="ghost" size="sm">
  Action
</Button>
```

### Badges

```tsx
<Badge
  variant="outline"
  className={cn('text-xs font-medium border', statusClassName)}
>
  {label}
</Badge>
```

### Detail Row

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

### Card/Container

```tsx
<div className="rounded-lg border border-border/50 bg-card/50 divide-y divide-border/50">
  {/* rows */}
</div>
```

### Gradient Header

```tsx
<div className="relative rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 p-6">
  {/* Decorative orb */}
  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl" />
  {/* Content */}
</div>
```

---

## Page Patterns

### Page Header

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-lg font-semibold tracking-tight">Page Title</h1>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
  <Button size="sm">
    <Icon className="h-4 w-4" strokeWidth={1.5} />
    Action
  </Button>
</div>
```

### Breadcrumb Navigation

```tsx
<nav className="flex items-center gap-2 text-sm">
  <Link className="text-muted-foreground hover:text-foreground transition-colors">
    Parent
  </Link>
  <span className="text-muted-foreground/50">/</span>
  <span className="text-foreground font-medium truncate">Current Page</span>
</nav>
```

### Tab Navigation

```tsx
<div className="border-b border-border">
  <nav className="flex gap-1">
    {tabs.map((tab) => (
      <Link
        key={tab.href}
        to={tab.href}
        className={cn(
          'relative flex items-center gap-2 px-3 md:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
          'hover:text-foreground',
          isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
        {tab.label}
        {isActive && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </Link>
    ))}
  </nav>
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-full bg-muted/50 p-4 mb-4">
    <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
  </div>
  <h3 className="text-lg font-semibold tracking-tight mb-1">No items found</h3>
  <p className="text-sm text-muted-foreground max-w-xs">
    Description of what to do next.
  </p>
</div>
```

### Error State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-full bg-destructive/10 p-4 mb-4">
    <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
  </div>
  <h3 className="text-lg font-semibold tracking-tight mb-1">Something went wrong</h3>
  <p className="text-sm text-muted-foreground mb-6">{errorMessage}</p>
  <Button variant="outline" size="sm" onClick={onRetry}>
    Try again
  </Button>
</div>
```

### Loading Skeleton

Match the structure of actual content:

```tsx
// Table skeleton
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

// Card skeleton
<Skeleton className="h-64 w-full rounded-lg" />
```

### Sidebar + Main Layout

```tsx
<div className="flex flex-col md:flex-row gap-8 md:gap-12">
  {/* Sidebar - hidden on mobile */}
  <aside className="hidden md:block md:w-64 flex-shrink-0">
    {/* Sidebar content */}
  </aside>

  {/* Main content */}
  <main className="flex-1">
    {/* Main content */}
  </main>
</div>
```

### Filter Chips

```tsx
// Selected state
<button className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
  Active
</button>

// Unselected state
<button className="px-3 py-1.5 rounded-full text-xs font-medium bg-transparent text-muted-foreground border border-border/60 hover:border-border">
  Inactive
</button>
```

### Stats Tiles

```tsx
<div className="grid sm:grid-cols-3 rounded-lg border border-border/50 overflow-hidden divide-x divide-border/50">
  <button className="relative flex flex-col items-start p-4 bg-muted/30 text-left hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-2 mb-3">
      <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
    {/* Optional keyboard shortcut */}
    <kbd className="absolute top-3 right-3 hidden sm:inline-flex h-5 px-1.5 items-center justify-center rounded border border-border/50 bg-muted/50 text-[10px] font-medium text-muted-foreground">
      D
    </kbd>
  </button>
</div>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width    | Usage                              |
| ---------- | -------- | ---------------------------------- |
| `sm`       | 640px    | Small adjustments                  |
| `md`       | 768px    | Tablet - show/hide sidebar         |
| `lg`       | 1024px   | Desktop - wider layouts            |

### Mobile Patterns

1. **Sidebar**: Hidden on mobile (`hidden md:block`), content accessible via tabs
2. **Tabs**: Horizontally scrollable with `overflow-x-auto` and `min-w-max`
3. **Tables**: Scroll horizontally or switch to card layout
4. **Modals/Dialogs**: Full-screen on mobile

### Scrollable Tabs (Mobile)

```tsx
<div className="border-b border-border -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
  <nav className="flex gap-1 min-w-max">
    {/* tabs */}
  </nav>
</div>
```

---

## File Structure

```
apps/web/src/components/
├── ui/                     # shadcn/ui primitives (restyled)
│   ├── index.ts            # Barrel export
│   ├── button.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   └── ...
├── composed/               # Complex compositions
│   ├── index.ts
│   ├── data-table/
│   ├── date-picker/
│   ├── empty-state/
│   └── ...
└── common/
    └── NavBar.tsx
```

---

## References

- [Linear Design](https://linear.app) — Design inspiration
- [shadcn/ui](https://ui.shadcn.com/) — Base component primitives
- [Tailwind CSS](https://tailwindcss.com/) — Utility classes
- [Lucide Icons](https://lucide.dev/) — Icon library
- [ADR: Linear Design System](./ADR/2026-01-18-linear-design-system.md) — Architecture decision record
