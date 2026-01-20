# Design System

A Linear-inspired design system built on shadcn/ui primitives with custom styling for a clean, minimal, and professional aesthetic.

## Table of Contents

- [Design Principles](#design-principles)
- [Semantic Color Tokens](#semantic-color-tokens)
- [Colors](#colors)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Page Patterns](#page-patterns)
- [Page Styling Guide](#page-styling-guide)
- [Page Styling Checklist](#page-styling-checklist)
- [Responsive Design](#responsive-design)

---

## Design Principles

1. **Minimal & Clean** — Reduce visual noise, let content breathe
2. **Dark Mode First** — Design for dark mode as primary, light mode secondary
3. **Subtle Interactions** — Soft hover states, smooth 150ms transitions
4. **Consistent Iconography** — Lucide icons at `h-4 w-4` with `strokeWidth={1.5}`
5. **Semantic Colors** — Use color to convey meaning, not decoration

---

## Semantic Color Tokens

Semantic tokens provide consistent, meaningful colors across the app. They support opacity modifiers and automatic dark mode handling.

### Status Colors

Used for state indicators (badges, chips, highlights).

| Token             | Usage                                   | Example                                           |
| ----------------- | --------------------------------------- | ------------------------------------------------- |
| `status-active`   | Active, enabled, success states         | `bg-status-active/10 border-status-active/20`     |
| `status-invited`  | Pending, invited, warning states        | `bg-status-invited/10 border-status-invited/20`   |
| `status-inactive` | Inactive, disabled, muted states        | `bg-status-inactive/10 border-status-inactive/20` |
| `status-*-text`   | Text color with light/dark mode support | `text-status-active-text`                         |

**Example usage:**

The Badge component has a built-in `status` prop for status indicators:

```tsx
<Badge status="active">Active</Badge>
<Badge status="invited">Invited</Badge>
<Badge status="inactive">Inactive</Badge>
```

### General-Purpose Semantic Colors

Used for icons, backgrounds, and visual emphasis across any feature.

| Token                | Color   | Usage                                |
| -------------------- | ------- | ------------------------------------ |
| `semantic-info`      | Blue    | Links, emails, informational content |
| `semantic-success`   | Emerald | Success states, completed actions    |
| `semantic-warning`   | Amber   | Warnings, caution, pending items     |
| `semantic-neutral`   | Zinc    | Inactive, disabled, muted content    |
| `semantic-accent`    | Violet  | User profiles, emphasized content    |
| `semantic-highlight` | Pink    | Secondary emphasis, decorative       |

### Alert Colors

Used for warning/duplicate alerts.

| Token                   | Usage              |
| ----------------------- | ------------------ |
| `alert-warning-bg`      | Alert background   |
| `alert-warning-border`  | Alert border       |
| `alert-warning-text`    | Alert body text    |
| `alert-warning-heading` | Alert heading text |

### Avatar Colors

Used for profile avatars in the client profile sidebar.

| Token           | Usage                     |
| --------------- | ------------------------- |
| `avatar-header` | Avatar section background |
| `avatar-bg`     | Avatar circle background  |
| `avatar-text`   | Avatar initials text      |

### Using Opacity Modifiers

All semantic tokens support Tailwind opacity modifiers:

```tsx
// Background with 10% opacity
<span className="bg-semantic-info/10">

// Border with 20% opacity
<div className="border-status-active/20">

// Full opacity text (no modifier needed)
<span className="text-semantic-success">
```

### Shadows

Shadows add subtle depth to content containers. Based on `/clients` pages:

| Element                   | Class       | Notes                                              |
| ------------------------- | ----------- | -------------------------------------------------- |
| Data tables               | `shadow-md` | `ClientsTable` - main list container               |
| Profile/sidebar cards     | `shadow-md` | `ClientProfileCard` - sidebar profile display      |
| Emphasized action buttons | `shadow-md` | "Resend invitation" button with border styling     |
| Loading skeletons         | No shadow   | Skeletons use borders only, shadow appears on load |

**Standard pattern** (table/card container):

```tsx
<div className="rounded-lg border border-border/50 overflow-hidden shadow-md">
```

**Button with shadow** (for emphasized actions):

```tsx
<Button variant="outline" className="border-semantic-info/30 text-semantic-info shadow-md">
```

**UI component shadows** (from shadcn primitives):

| Component          | Shadow      |
| ------------------ | ----------- |
| Primary buttons    | `shadow-sm` |
| Dialogs/sheets     | `shadow-lg` |
| Popovers/dropdowns | `shadow-md` |
| Form inputs        | `shadow-xs` |

---

## Colors

### Base Palette

| Token          | Light Mode     | Dark Mode      | Usage                |
| -------------- | -------------- | -------------- | -------------------- |
| `--background` | `0 0% 100%`    | `0 0% 2%`      | Page background      |
| `--foreground` | `0 0% 9%`      | `0 0% 98%`     | Primary text         |
| `--muted`      | `0 0% 96%`     | `0 0% 15%`     | Muted backgrounds    |
| `--border`     | `240 5.9% 90%` | `0 0% 12%`     | Borders and dividers |
| `--primary`    | `250 100% 60%` | `250 100% 65%` | Primary actions      |

### Semantic Icon Colors

Use semantic tokens for icons with colored backgrounds. For common purposes, use the tokens defined in [Semantic Color Tokens](#semantic-color-tokens):

| Purpose      | Background                 | Text                    | Example Usage         |
| ------------ | -------------------------- | ----------------------- | --------------------- |
| Email/Links  | `bg-semantic-info/10`      | `text-semantic-info`    | Email fields, URLs    |
| Success      | `bg-semantic-success/10`   | `text-semantic-success` | Active status, deals  |
| Warning      | `bg-semantic-warning/10`   | `text-semantic-warning` | Pending, invited      |
| User/Profile | `bg-semantic-accent/10`    | `text-semantic-accent`  | Nickname, user info   |
| Family       | `bg-semantic-highlight/10` | `text-semantic-highlight`| Relationships        |
| Calendar     | `bg-semantic-warning/10`   | `text-semantic-warning` | Dates, schedules      |
| Preferences  | `bg-orange-500/10`         | `text-orange-500`       | Settings, preferences |
| Food         | `bg-rose-500/10`           | `text-rose-500`         | Food preferences      |
| Children     | `bg-sky-500/10`            | `text-sky-500`          | Family members        |
| Inactive     | `bg-semantic-neutral/10`   | `text-semantic-neutral` | Disabled, muted       |
| Error        | `bg-destructive/10`        | `text-destructive`      | Errors, warnings      |

### Status Badge Colors

The Badge component has a built-in `status` prop that applies these styles automatically:

```tsx
<Badge status="active">Active</Badge>
```

For reference, here are the underlying tokens if you need them elsewhere:

| Status   | Background              | Text                        | Border                      |
| -------- | ----------------------- | --------------------------- | --------------------------- |
| Active   | `bg-status-active/10`   | `text-status-active-text`   | `border-status-active/20`   |
| Invited  | `bg-status-invited/10`  | `text-status-invited-text`  | `border-status-invited/20`  |
| Inactive | `bg-status-inactive/10` | `text-status-inactive-text` | `border-status-inactive/20` |

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

### Icon with Colored Background (Data Rows Only)

Use semantic colored icons **only for data rows** where the icon represents the type of data (email, phone, date, etc.). These help users quickly scan and identify information types.

```tsx
// In a data row showing an email address
<span className="p-2 rounded-lg bg-semantic-info/10 text-semantic-info">
  <Mail className="h-4 w-4" strokeWidth={1.5} />
</span>
```

**Do NOT use colored icons for section headers.** See below.

### Icon with Neutral Background (Section Headers)

Section headers should use **neutral/black icons** to avoid visual noise. The section title provides context, so the icon doesn't need color to convey meaning.

```tsx
// In a section header (e.g., "Profile Information", "Email Address")
<span className="p-2 rounded-lg bg-muted text-foreground">
  <User className="h-4 w-4" strokeWidth={1.5} />
</span>
```

**When to use which:**

| Context                          | Icon Style                                  |
| -------------------------------- | ------------------------------------------- |
| Section/card headers             | Neutral: `bg-muted text-foreground`         |
| Data rows (email, phone, etc.)   | Semantic: `bg-semantic-info/10 text-semantic-info` |
| Status indicators                | Status: `bg-status-active/10 text-status-active-text` |
| Empty states                     | Muted: `bg-muted/50 text-muted-foreground`  |
| Error states                     | Destructive: `bg-destructive/10 text-destructive` |

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

For status indicators, use the built-in `status` prop:

```tsx
<Badge status="active">Active</Badge>
<Badge status="invited">Invited</Badge>
<Badge status="inactive">Inactive</Badge>
```

For other badges, use the `variant` prop:

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Detail Row

Two-line layout with icon, label, and value:

```tsx
<div className="flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
  <span className="p-2 rounded-lg bg-semantic-info/10 text-semantic-info">
    <Icon className="h-4 w-4" strokeWidth={1.5} />
  </span>
  <div className="flex-1 min-w-0">
    <span className="block text-xs text-muted-foreground">{label}</span>
    <p className="text-sm font-medium truncate">{value}</p>
  </div>
</div>
```

### Card/Container

Section containers should always have a **white/card background** (`bg-card`), not colored backgrounds. Only small icon containers inside rows should have semantic colors.

```tsx
// Section container - always use bg-card for white background
<div className="rounded-lg border border-border/50 bg-card shadow-md">
  {/* header */}
  <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
    <span className="p-2 rounded-lg bg-muted text-foreground">
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </span>
    <h3 className="text-sm font-medium">Section Title</h3>
  </div>
  {/* content */}
  <div className="p-4">
    {/* ... */}
  </div>
</div>
```

**Important:** Never apply semantic background colors (like `bg-semantic-info/10`) to section containers. These are only for small icon wrappers.

### Form Inputs Inside Cards

When placing form inputs inside a card/section with `bg-card`, use `bg-transparent` on inputs so they blend with the container background:

```tsx
<div className="rounded-lg border border-border/50 bg-card shadow-md p-4">
  <Input className="bg-transparent" placeholder="Enter value..." />
</div>
```

This prevents inputs from appearing as a different shade than the card background.

### Highlighting Active/Current Items

When displaying a list where one item is "current" or "active" (e.g., current session, selected item), use a left border accent:

```tsx
// Current/active item in a list
<div className={cn(
  "flex items-center gap-3 px-4 py-4",
  isCurrent && "bg-primary/5 border-l-2 border-l-primary"
)}>
  {/* content */}
</div>
```

This provides a subtle but clear visual indicator without overwhelming the design.

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
          "relative flex items-center gap-2 px-3 md:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
          "hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground"
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
  <h3 className="text-lg font-semibold tracking-tight mb-1">
    Something went wrong
  </h3>
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
  <main className="flex-1">{/* Main content */}</main>
</div>
```

### Filter Chips

```tsx
// Selected state
<button className="px-3 py-1.5 rounded-full text-xs font-medium bg-status-active/15 text-status-active-text border border-status-active/30">
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
      <span className="p-1.5 rounded-md bg-semantic-success/10 text-semantic-success">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <span className="text-2xl font-semibold tracking-tight tabular-nums">
      {value}
    </span>
    {/* Optional keyboard shortcut */}
    <kbd className="absolute top-3 right-3 hidden sm:inline-flex h-5 px-1.5 items-center justify-center rounded border border-border/50 bg-muted/50 text-[10px] font-medium text-muted-foreground">
      D
    </kbd>
  </button>
</div>
```

---

## Page Styling Guide

Follow these steps to create a page that matches the `/clients` aesthetic.

### Step 1: Page Structure

Every page should follow this basic structure:

```tsx
<div className="space-y-6">
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Page Title</h1>
      <p className="text-sm text-muted-foreground">Descriptive subtitle</p>
    </div>
    <Button size="sm">
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      Action
    </Button>
  </div>

  {/* Page Content */}
  <div className="rounded-lg border border-border/50 divide-y divide-border/50">
    {/* Content rows */}
  </div>
</div>
```

### Step 2: Section Headers

For content sections within a page:

```tsx
<h3 className="text-sm font-medium text-muted-foreground mb-3">
  Section Title
</h3>
```

### Step 3: Bordered Containers

Use 50% opacity borders for a softer appearance:

```tsx
<div className="rounded-lg border border-border/50 divide-y divide-border/50">
  {/* rows */}
</div>
```

### Step 4: Interactive Rows

For clickable/hoverable list items:

```tsx
<div className="flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
  {/* row content */}
</div>
```

### Step 5: Icon with Colored Background

Use semantic tokens for icon backgrounds:

```tsx
<span className="p-2 rounded-lg bg-semantic-info/10 text-semantic-info">
  <Mail className="h-4 w-4" strokeWidth={1.5} />
</span>
```

### Step 6: Status Badges

For status indicators, use the built-in `status` prop:

```tsx
<Badge status="active">Active</Badge>
<Badge status="invited">Invited</Badge>
<Badge status="inactive">Inactive</Badge>
```

### Step 7: Empty States

Centered with rounded icon container:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-full bg-muted/50 p-4 mb-4">
    <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
  </div>
  <h3 className="text-lg font-semibold tracking-tight mb-1">No items found</h3>
  <p className="text-sm text-muted-foreground max-w-xs">Description text</p>
</div>
```

### Step 8: Loading Skeletons

Match the structure of actual content:

```tsx
<div className="rounded-lg border border-border/50 overflow-hidden">
  {Array.from({ length: 5 }).map((_, i) => (
    <div
      key={i}
      className="flex items-center gap-3 px-4 py-4 border-b border-border/50"
    >
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  ))}
</div>
```

---

## Page Styling Checklist

Use this checklist when creating or refactoring a page:

**Layout & Typography:**
- [ ] Page title uses `text-lg font-semibold tracking-tight`
- [ ] Subtitles use `text-sm text-muted-foreground`
- [ ] Icons are `h-4 w-4` with `strokeWidth={1.5}`

**Section Containers:**
- [ ] Section containers use `bg-card` for white background
- [ ] Containers use `border-border/50` (50% opacity borders)
- [ ] Tables and cards use `shadow-md` with `border-border/50`

**Icons (important distinction):**
- [ ] Section header icons use `bg-muted text-foreground` (neutral/black)
- [ ] Data row icons use `bg-semantic-*/10 text-semantic-*` (colored)
- [ ] Never apply semantic colors to section containers, only to small icon wrappers

**Forms:**
- [ ] Form inputs inside cards use `bg-transparent` to blend with background

**Interactive Elements:**
- [ ] Hover states use `hover:bg-muted/30 transition-colors`
- [ ] Active/current items use `bg-primary/5 border-l-2 border-l-primary`
- [ ] Status indicators use `<Badge status="...">` prop
- [ ] Emphasized action buttons use `shadow-md`

**States:**
- [ ] Empty states are centered with `py-16`
- [ ] Loading skeletons match content structure (no shadow)
- [ ] Responsive: sidebar hidden on mobile (`hidden md:block`)
- [ ] Dark mode: check all states render correctly

---

## Responsive Design

### Breakpoints

| Breakpoint | Width  | Usage                      |
| ---------- | ------ | -------------------------- |
| `sm`       | 640px  | Small adjustments          |
| `md`       | 768px  | Tablet - show/hide sidebar |
| `lg`       | 1024px | Desktop - wider layouts    |

### Mobile Patterns

1. **Sidebar**: Hidden on mobile (`hidden md:block`), content accessible via tabs
2. **Tabs**: Horizontally scrollable with `overflow-x-auto` and `min-w-max`
3. **Tables**: Scroll horizontally or switch to card layout
4. **Modals/Dialogs**: Full-screen on mobile

### Scrollable Tabs (Mobile)

```tsx
<div className="border-b border-border -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
  <nav className="flex gap-1 min-w-max">{/* tabs */}</nav>
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
- [ADR: Linear Design System](../ADR/2026-01-18-linear-design-system.md) — Architecture decision record
