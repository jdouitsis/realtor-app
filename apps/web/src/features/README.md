# Features Directory

This directory contains feature modules for the application. Each feature is a self-contained unit that encapsulates related pages, components, hooks, and utilities.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Feature Anatomy](#feature-anatomy)
- [Component & Hook Organization](#component--hook-organization)
  - [Page-Scoped (Default)](#page-scoped-default)
  - [Feature-Scoped (Shared)](#feature-scoped-shared)
  - [Decision Flow](#decision-flow)
- [Naming Conventions](#naming-conventions)
  - [Files](#files)
  - [Exports](#exports)
- [Creating a New Feature](#creating-a-new-feature)
- [How Features Connect to Routes](#how-features-connect-to-routes)
- [Barrel Exports (index.ts)](#barrel-exports-indexts)
- [Component Guidelines](#component-guidelines)
  - [Page Components](#page-components)
  - [Page-Specific Components](#page-specific-components)
  - [Shared Feature Components](#shared-feature-components)
- [Storybook Stories](#storybook-stories)
- [Import Paths](#import-paths)
- [Checklist for New Features](#checklist-for-new-features)
- [Checklist for Promoting to Shared](#checklist-for-promoting-to-shared)

## Directory Structure

```
features/
├── auth/                    # Authentication feature
│   ├── components/          # Shared components (used by multiple pages)
│   │   └── AuthHeader.tsx
│   ├── hooks/               # Shared hooks (used by multiple pages)
│   │   └── useAuth.ts
│   ├── pages/               # Page directories
│   │   ├── LoginPage/       # Each page has its own directory
│   │   │   ├── index.tsx    # The page component
│   │   │   ├── components/  # Page-specific components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LoginForm.stories.tsx
│   │   │   └── hooks/       # Page-specific hooks
│   │   │       └── useLoginForm.ts
│   │   └── RegisterPage/
│   │       ├── index.tsx
│   │       └── components/
│   │           ├── RegisterForm.tsx
│   │           └── RegisterForm.stories.tsx
│   └── index.ts             # Barrel export
├── dashboard/
│   ├── components/          # Shared across dashboard pages
│   ├── pages/
│   │   └── DashboardPage/
│   └── index.ts
└── home/
    ├── pages/
    │   └── HomePage/
    └── index.ts
```

## Feature Anatomy

Each feature should contain the following subdirectories as needed:

| Directory     | Purpose                            | Naming Convention               |
| ------------- | ---------------------------------- | ------------------------------- |
| `pages/`      | Page components rendered by routes | `{Feature}Page.tsx`             |
| `components/` | Feature-specific UI components     | `{ComponentName}.tsx`           |
| `hooks/`      | Custom React hooks                 | `use{HookName}.ts`              |
| `types/`      | TypeScript types and interfaces    | `{name}.types.ts` or `index.ts` |
| `utils/`      | Utility functions                  | `{name}.ts`                     |
| `api/`        | API calls and tRPC procedures      | `{name}.api.ts`                 |

## Component & Hook Organization

**Key Rule**: Each page should have its own directory containing its components, hooks, and stories. Only promote items to the feature level when shared.

### Page-Scoped (Default)

Components and hooks that are only used by a single page live inside that page's subdirectories:

```
pages/
└── LoginPage/
    ├── index.tsx            # The page component
    ├── components/          # Page-specific components
    │   ├── LoginForm.tsx
    │   └── LoginForm.stories.tsx
    ├── hooks/               # Page-specific hooks
    │   └── useLoginForm.ts
    └── utils/               # Page-specific utilities
        └── validation.ts
```

These are **not exported** from the feature's `index.ts` - they are internal to the page.

### Feature-Scoped (Shared)

When a component or hook is used by **multiple pages** within the same feature, move it to the feature-level directory:

```
auth/
├── components/              # Shared across auth pages
│   └── AuthHeader.tsx       # Used by both LoginPage and RegisterPage
├── hooks/
│   └── useAuth.ts           # Used by multiple auth pages
└── pages/
    ├── LoginPage/
    └── RegisterPage/
```

These **should be exported** from `index.ts` if needed by other features.

### Decision Flow

```
Is the component/hook used by only one page?
  └── YES → Put it in pages/{PageName}/
  └── NO  → Is it used by multiple pages in this feature?
              └── YES → Put it in {feature}/components/ or {feature}/hooks/
              └── NO  → Is it used by multiple features?
                          └── YES → Put it in src/components/ or src/hooks/
```

## Naming Conventions

### Files

- **Pages**: `{Feature}Page.tsx` (e.g., `LoginPage.tsx`, `DashboardPage.tsx`)
- **Components**: PascalCase (e.g., `LoginForm.tsx`, `Sidebar.tsx`)
- **Hooks**: `use{Name}.ts` (e.g., `useAuth.ts`, `useUser.ts`)
- **Stories**: `{Component}.stories.tsx` (e.g., `LoginForm.stories.tsx`)
- **Types**: `{name}.types.ts` or `types/index.ts`
- **Utils**: camelCase (e.g., `formatDate.ts`, `validation.ts`)

### Exports

- **Components**: Named exports with PascalCase (e.g., `export function LoginForm()`)
- **Hooks**: Named exports (e.g., `export function useAuth()`)
- **Types**: Named exports (e.g., `export type User = ...`)

## Creating a New Feature

### Step 1: Create the feature and page directories

```bash
mkdir -p src/features/{feature-name}/pages/{FeaturePage}/components
```

### Step 2: Create the page component

Create `src/features/{feature-name}/pages/{FeaturePage}/index.tsx`:

```tsx
// src/features/settings/pages/SettingsPage/index.tsx
import { SettingsForm } from './components/SettingsForm'

export function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <SettingsForm />
    </div>
  )
}
```

### Step 3: Create page-specific components

Create components in the page's `components/` subdirectory:

```tsx
// src/features/settings/pages/SettingsPage/components/SettingsForm.tsx
export function SettingsForm() {
  return <form>{/* Form fields */}</form>
}
```

### Step 4: Create the barrel export

Create `src/features/{feature-name}/index.ts`:

```ts
// Only export the page component, not internal components
export { SettingsPage } from './pages/SettingsPage'
```

### Step 5: Create the route file

Create `src/routes/{feature-name}.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/features/settings'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
```

## How Features Connect to Routes

Features export **only page components**. Route files in `src/routes/` import page components from features and define the routing:

```
┌──────────────────────┐      ┌─────────────────────────────────────┐
│  src/routes/         │      │  src/features/auth/                 │
│  login.tsx           │──────│                                     │
│                      │      │  pages/LoginPage/                   │
│  export const Route  │      │    ├── index.tsx       ← exported   │
│    = createFileRoute │      │    ├── components/     ← internal   │
│      ('/login')({    │      │    │   └── LoginForm.tsx            │
│        component:    │      │    └── hooks/                       │
│          LoginPage   │      │        └── useLoginForm.ts          │
│      })              │      │                                     │
│                      │      │  index.ts                           │
│                      │      │    export { LoginPage }             │
│                      │      │      from './pages/LoginPage'       │
└──────────────────────┘      └─────────────────────────────────────┘
```

## Barrel Exports (index.ts)

Every feature must have an `index.ts` that exports its public API:

```ts
// src/features/auth/index.ts

// Pages - always export page components
export { LoginPage } from './pages/LoginPage'
export { RegisterPage } from './pages/RegisterPage'

// Shared components - only if used by other features
export { AuthHeader } from './components/AuthHeader'

// Shared hooks - only if used by other features
export { useAuth } from './hooks/useAuth'

// Types - export public types
export type { User, AuthState } from './types'

// DO NOT export page-specific components like LoginForm
// They are internal to the page directory
```

Only export what other parts of the application need:

- **Always export**: Page components (for routes)
- **Export if shared**: Feature-level components and hooks used by other features
- **Never export**: Page-specific components, hooks, and utilities

## Component Guidelines

### Page Components

Page components are the top-level components rendered by routes. They live in `index.tsx` and import from `./components`:

```tsx
// src/features/dashboard/pages/DashboardPage/index.tsx
import { Sidebar } from './components/Sidebar'
import { DashboardContent } from './components/DashboardContent'
import { Header } from '@/components/common/Header'

export function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Header />
        <DashboardContent />
      </main>
    </div>
  )
}
```

### Page-Specific Components

Components that are only used by one page live in that page's `components/` subdirectory:

```tsx
// src/features/auth/pages/LoginPage/components/LoginForm.tsx
import { Button, Input, Label } from '@/components/ui'

export function LoginForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  )
}
```

### Shared Feature Components

Components used by multiple pages in a feature live at the feature level:

```tsx
// src/features/auth/components/AuthHeader.tsx
// Used by both LoginPage and RegisterPage

export function AuthHeader({ title }: { title: string }) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  )
}
```

## Storybook Stories

Stories are co-located with their components in the `components/` directory:

```tsx
// src/features/auth/pages/LoginPage/components/LoginForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoginForm } from './LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'Features/Auth/LoginPage/LoginForm',
  component: LoginForm,
}

export default meta
type Story = StoryObj<typeof LoginForm>

export const Default: Story = {}
```

Story title convention: `Features/{Feature}/{Page}/{Component}`

## Import Paths

Use the `@/` alias for absolute imports:

```tsx
// Shared UI components
import { Button } from '@/components/ui'

// Shared common components
import { Header } from '@/components/common/Header'

// Feature imports (from other features if needed)
import { useAuth } from '@/features/auth'

// Page-specific components (from page to its components/)
import { LoginForm } from './components/LoginForm'

// Page-specific hooks (from page to its hooks/)
import { useLoginForm } from './hooks/useLoginForm'

// Shared feature components (from page to feature level)
import { AuthHeader } from '../../components/AuthHeader'
```

## Checklist for New Features

- [ ] Create feature directory: `src/features/{feature-name}/`
- [ ] Create page directory: `pages/{FeaturePage}/`
- [ ] Create page component: `index.tsx`
- [ ] Create `components/` subdirectory for page-specific components
- [ ] Create `hooks/` subdirectory if page needs custom hooks
- [ ] Create barrel export in feature's `index.ts` (only export page components)
- [ ] Create route file in `src/routes/`
- [ ] Add stories for components (optional but recommended)

## Checklist for Promoting to Shared

When a component/hook needs to be shared across pages:

- [ ] Move from `pages/{PageName}/components/` to `{feature}/components/`
- [ ] Or move from `pages/{PageName}/hooks/` to `{feature}/hooks/`
- [ ] Update imports in all pages that use it
- [ ] Add to `index.ts` if needed by other features
- [ ] Update story title to reflect new location
