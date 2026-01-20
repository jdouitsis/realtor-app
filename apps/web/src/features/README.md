# Features Directory

Self-contained feature modules that encapsulate pages, components, hooks, and utilities.

## Why This Structure?

| Principle               | Rationale                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| **Colocation**          | Related code lives together—easier to find, modify, and delete as a unit |
| **Explicit boundaries** | Features export only what's needed; internals stay private               |
| **Scalability**         | New features slot in without touching existing code                      |
| **Route separation**    | Features own UI logic; routes own navigation—single responsibility       |

## Structure at a Glance

```
features/
└── {feature}/
    ├── index.ts              # Barrel export (public API)
    ├── components/           # Shared within feature (optional)
    ├── hooks/                # Shared within feature (optional)
    └── pages/
        └── {Feature}Page/
            ├── index.tsx     # Page component
            ├── components/   # Page-specific (internal)
            ├── hooks/        # Page-specific (internal)
            └── tabs/         # Tab components for tabbed pages (internal)
```

## Scope Decision Flow

```
Used by one page only?     → pages/{PageName}/components/
Used by multiple pages?    → {feature}/components/
Used by multiple features? → src/components/
```

## Quick Reference

### Creating a Feature

```bash
# 1. Create directories
mkdir -p src/features/{name}/pages/{Name}Page/components

# 2. Create page component
# src/features/{name}/pages/{Name}Page/index.tsx
export function {Name}Page() { ... }

# 3. Create barrel export
# src/features/{name}/index.ts
export { {Name}Page } from './pages/{Name}Page'

# 4. Create route
# src/routes/{name}.tsx
import { {Name}Page } from '@/features/{name}'
export const Route = createFileRoute('/{name}')({ component: {Name}Page })
```

### Adding a Component

```bash
# Page-specific (default)
src/features/{name}/pages/{Name}Page/components/{Component}.tsx

# Shared across pages in feature
src/features/{name}/components/{Component}.tsx
```

### Promoting to Shared

1. Move file from `pages/{Page}/components/` → `{feature}/components/`
2. Update imports in all consuming pages
3. Add to `index.ts` only if needed by other features

## Rules

| Do                                             | Don't                                |
| ---------------------------------------------- | ------------------------------------ |
| Export page components from `index.ts`         | Export page-internal components      |
| Keep components in page directory until shared | Prematurely promote to feature level |
| Use relative imports within a page             | Use `@/` for same-page imports       |
| Co-locate stories with components              | Put stories in a separate directory  |

## Naming

| Type      | Convention            | Example                    |
| --------- | --------------------- | -------------------------- |
| Page      | `{Feature}Page`       | `LoginPage`, `ClientsPage` |
| Component | PascalCase            | `LoginForm`, `StatusBadge` |
| Hook      | `use{Name}`           | `useAuth`, `useLoginForm`  |
| Story     | `{Component}.stories` | `LoginForm.stories.tsx`    |

## Checklist

**New Feature:**

- [ ] `src/features/{name}/` directory created
- [ ] `pages/{Name}Page/index.tsx` exports page component
- [ ] `index.ts` barrel exports page component
- [ ] Route file created in `src/routes/`

**New Page Component:**

- [ ] Lives in `pages/{Name}Page/components/`
- [ ] Not exported from feature `index.ts`
- [ ] Story co-located (optional)

**Promoting Component:**

- [ ] Moved to `{feature}/components/`
- [ ] Imports updated in all pages
- [ ] Added to `index.ts` if cross-feature
