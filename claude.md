# Concord

A Concord application built as a pnpm monorepo with Turborepo orchestration.

## IMPORTANT: Read Documentation First

BEFORE reading any code files, you MUST read relevant documentation:

1. [`docs/ADR/README.md`](docs/ADR/README.md) - Check for architecture decisions related to your task
2. [`docs/SOP/README.md`](docs/SOP/README.md) - Check for standard operating procedures if performing a repo-level task
3. Walk up from the file in question to find the nearest README.md and read it

Do NOT skip this step even if the question seems simple. This prevents wasting context on code before understanding the patterns and decisions already in place.

## Tech Stack

- **Frontend**: React 19, Vite, TanStack Router, TanStack Query, TailwindCSS 3
- **UI Components**: shadcn/ui (Radix primitives + CVA)
- **Forms**: react-hook-form + zod v4
- **API**: tRPC
- **Testing**: Vitest, Storybook 10
- **Tooling**: TypeScript, oxlint + ESLint (flat config), Prettier, Husky, lint-staged

## Monorepo Structure

```
/
├── apps/web/          # React frontend application
├── apps/server/       # Express + tRPC backend
├── packages/shared/   # Shared types and constants (e.g., error codes)
├── docs/SOP/          # Standard operating procedures
├── docs/ADR/          # Architecture decision records
├── .husky/            # Git hooks (calls turbo commands)
├── turbo.json         # Turborepo task configuration
└── package.json       # Root scripts (turbo delegators only)
```

## Key Principles

1. **App-specific configs** - All tool configs (ESLint, Prettier, lint-staged) live in `apps/*/`, not root
2. **Turbo orchestration** - Root package.json only contains `turbo <task>` scripts

## Commands

```bash
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm typecheck     # Run TypeScript checks
pnpm lint          # Run oxlint + ESLint
pnpm format        # Format with Prettier
pnpm storybook     # Start Storybook
```

## Finding the Right README

When walking up the directory tree, here's an example:

```
src/features/auth/pages/LoginPage/components/LoginForm.tsx
                                             ↑ no .md
                                  ↑ no .md
                       ↑ no .md
            ↑ features/README.md  ← read this
```

Key documentation locations:

- `apps/*/README.md` - Feature module conventions
- `docs/SOP/README.md` - Standard operating procedures for repo-level tasks
- `docs/ADR/README.md` - Architecture decisions index

## Rules

### Keep Documentation Updated

When making code changes, update the closest README file with any relevant changes. Walk up the directory tree to find the nearest `.md` file and update it to reflect:

- New files, directories, or patterns introduced
- Changed commands or configuration
- New dependencies or environment variables
- Modified conventions or workflows

**IMPORTANT:** After modifying code, search for READMEs and ADRs that reference the changed files or patterns. Update them in the same session, not as an afterthought.

This ensures documentation stays in sync with the codebase.

### Markdown Tables

Format tables with consistent column widths so they are readable in raw markdown, not just when rendered.

**Good:**

```markdown
| Command        | Description           |
| -------------- | --------------------- |
| pnpm dev       | Start dev server      |
| pnpm build     | Build for production  |
| pnpm typecheck | Run TypeScript checks |
```

**Bad:**

```markdown
| Command        | Description           |
| -------------- | --------------------- |
| pnpm dev       | Start dev server      |
| pnpm build     | Build for production  |
| pnpm typecheck | Run TypeScript checks |
```

### Database Migrations

Never use `db:push` for schema changes. Always generate and apply migrations:

```bash
pnpm --filter @concordpoint/server db:generate  # Generate migration file
pnpm --filter @concordpoint/server db:migrate   # Apply migrations
```

This ensures migration files are tracked in git and can be applied consistently across all environments (development, CI, production).

### Soft Deletions

Always use soft deletions (adding a `deleted_at` timestamp column) instead of hard deletions (`DELETE FROM`). This preserves data for auditing, recovery, and referential integrity.

**Hard deletions require explicit dev approval.** If a task genuinely requires permanently removing data, ask the dev to confirm before implementing.

### Function Documentation

Add JSDoc comments to all exported functions. Include a brief description and an `@example` when the usage isn't obvious.

**Format:**

```typescript
/**
 * Brief description of what the function does.
 *
 * @example
 * functionName('arg1', 'arg2')
 */
export function functionName(arg1: string, arg2: string): ReturnType {
```

**Good:**

```typescript
/**
 * Factory function for "not found" errors.
 *
 * @example
 * throw notFound('User', userId)
 */
export function notFound(resource: string, id?: string) {
```

**Skip docstrings for:**

- React components (props interface is sufficient)
- Simple one-liner utilities where the name is self-documenting
- Internal/private functions

### React Component Patterns

Never assign JSX to variables inside a component. If you need to extract a piece of UI, create a separate component function defined below the main component in the same file.

**Bad:**

```tsx
function ProfilePage() {
  const headerContent = (
    <div className="flex items-center">
      <h1>Settings</h1>
      <Button onClick={handleLogout}>Log out</Button>
    </div>
  )

  return <Layout header={headerContent}>...</Layout>
}
```

**Good:**

```tsx
function ProfilePage() {
  return <Layout header={<HeaderContent onLogout={handleLogout} />}>...</Layout>
}

function HeaderContent({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex items-center">
      <h1>Settings</h1>
      <Button onClick={onLogout}>Log out</Button>
    </div>
  )
}
```

This pattern improves readability, enables React to optimize re-renders, and makes the extracted UI reusable and testable.

## Git

### Commit Titles

Use [Conventional Commits](https://www.conventionalcommits.org/) with specific scopes that identify both the app and the area being changed:

```
<type>(<app>:<area>): <description>
```

| Part            | Description                                  | Examples                          |
| --------------- | -------------------------------------------- | --------------------------------- |
| `<type>`        | The type of change                           | `feat`, `fix`, `docs`, `refactor` |
| `<app>`         | Which app in the monorepo                    | `web`, `server`                   |
| `<area>`        | Specific area within the app                 | `auth`, `prettier`, `trpc`, `ui`  |
| `<description>` | Short description of the change (imperative) | `Add login form validation`       |

**Examples:**

```
feat(web:auth): Add login form validation
fix(server:trpc): Handle null user in me procedure
docs(web:prettier): Document import ordering rules
refactor(web:ui): Extract Button variants to separate file
chore(server:deps): Update express to v5
```

For changes spanning multiple areas or the whole app, omit the area:

```
feat(web): add dark mode support
fix(server): update all procedures to use new context
```

For repo-wide changes, omit both:

```
chore: update pnpm to v9
docs: add contributing guide
```

## README Index

> **Maintenance:** When any README is added, removed, or its purpose changes, update this section.

| README                                                               | When to Use                                                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`README.md`](README.md)                                             | Project overview, getting started, Railway deployment             |
| [`docs/prod-requirements.md`](docs/prod-requirements.md)             | Future production improvements to address before release          |
| [`docs/SOP/README.md`](docs/SOP/README.md)                           | Repo-level tasks: adding commands, setting up tools, git hooks    |
| [`docs/ADR/README.md`](docs/ADR/README.md)                           | Architecture decisions and their rationale                        |
| [`apps/web/README.md`](apps/web/README.md)                           | Understanding the web app structure, commands, and tech stack     |
| [`apps/web/src/lib/README.md`](apps/web/src/lib/README.md)           | Error handling, tRPC client, QueryClient, storage utilities       |
| [`apps/web/src/features/README.md`](apps/web/src/features/README.md) | Creating features, pages, components; naming conventions; exports |
| [`apps/server/README.md`](apps/server/README.md)                     | Server architecture, tRPC setup, domain structure                 |
| [`packages/shared/README.md`](packages/shared/README.md)             | Shared types between server and client; adding new error codes    |
