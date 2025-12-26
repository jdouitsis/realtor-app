# Finance App

A finance application built as a pnpm monorepo with Turborepo orchestration.

## Tech Stack

- **Frontend**: React 19, Vite, TanStack Router, TanStack Query, TailwindCSS 3
- **UI Components**: shadcn/ui (Radix primitives + CVA)
- **Forms**: react-hook-form + zod v4
- **API**: tRPC
- **Testing**: Vitest, Storybook 10
- **Tooling**: TypeScript, ESLint (flat config), Prettier, Husky, lint-staged

## Monorepo Structure

```
/
├── apps/web/          # React frontend application
├── docs/SOP/          # Standard operating procedures
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
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
pnpm storybook     # Start Storybook
```

## Finding Context

When modifying a file, walk up the directory tree until you find a `.md` file and read it for context about conventions and patterns for that area of the codebase.

```
src/features/auth/pages/LoginPage/components/LoginForm.tsx
                                             ↑ no .md
                                  ↑ no .md
                       ↑ no .md
            ↑ features/README.md  ← read this
```

Key documentation locations:

- `apps/*/README.md` - Feature module conventions
- `docs/SOP/` - Standard operating procedures for repo-level tasks. Read the `docs/SOP/README.md` to understand which SOP you need

## Rules

### Keep Documentation Updated

When making code changes, update the closest README file with any relevant changes. Walk up the directory tree to find the nearest `.md` file and update it to reflect:

- New files, directories, or patterns introduced
- Changed commands or configuration
- New dependencies or environment variables
- Modified conventions or workflows

This ensures documentation stays in sync with the codebase.

### Markdown Tables

Format tables with consistent column widths so they are readable in raw markdown, not just when rendered.

**Good:**
```markdown
| Command        | Description              |
| -------------- | ------------------------ |
| pnpm dev       | Start dev server         |
| pnpm build     | Build for production     |
| pnpm typecheck | Run TypeScript checks    |
```

**Bad:**
```markdown
| Command | Description |
| --- | --- |
| pnpm dev | Start dev server |
| pnpm build | Build for production |
| pnpm typecheck | Run TypeScript checks |
```

## Git

### Commit Titles

Use [Conventional Commits](https://www.conventionalcommits.org/) with specific scopes that identify both the app and the area being changed:

```
<type>(<app>:<area>): <description>
```

| Part          | Description                                    | Examples                          |
| ------------- | ---------------------------------------------- | --------------------------------- |
| `<type>`      | The type of change                             | `feat`, `fix`, `docs`, `refactor` |
| `<app>`       | Which app in the monorepo                      | `web`, `server`                   |
| `<area>`      | Specific area within the app                   | `auth`, `prettier`, `trpc`, `ui`  |
| `<description>` | Short description of the change (imperative) | `add login form validation`       |

**Examples:**

```
feat(web:auth): add login form validation
fix(server:trpc): handle null user in me procedure
docs(web:prettier): document import ordering rules
refactor(web:ui): extract Button variants to separate file
chore(server:deps): update express to v5
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

| README                                                               | When to Use                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`README.md`](README.md)                                             | Project overview, getting started, Railway deployment              |
| [`docs/SOP/README.md`](docs/SOP/README.md)                           | Repo-level tasks: adding commands, setting up tools, git hooks     |
| [`apps/web/README.md`](apps/web/README.md)                           | Understanding the web app structure, commands, and tech stack      |
| [`apps/server/README.md`](apps/server/README.md)                     | Server architecture, tRPC setup, domain structure                  |
| [`apps/web/src/features/README.md`](apps/web/src/features/README.md) | Creating features, pages, components; naming conventions; exports  |
