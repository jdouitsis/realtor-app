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
