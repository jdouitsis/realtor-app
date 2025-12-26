# Web App

The React frontend application for the finance platform.

## Tech Stack

- **Framework**: React 19 with Vite
- **Routing**: TanStack Router (file-based)
- **Data Fetching**: TanStack Query + tRPC
- **Styling**: TailwindCSS 3 + shadcn/ui
- **Forms**: react-hook-form + Zod v4
- **Testing**: Vitest + Storybook 10

## Directory Structure

```
src/
├── assets/           # Static assets (images, fonts)
├── components/       # Shared components
│   ├── ui/           # shadcn/ui primitives (Button, Input, etc.)
│   └── common/       # App-wide shared components
├── features/         # Feature modules (see features/README.md)
├── lib/              # Utilities and configurations
│   ├── query.ts      # TanStack Query client
│   ├── trpc.ts       # tRPC client setup
│   └── utils.ts      # General utilities (cn helper)
├── routes/           # TanStack Router file-based routes
├── index.css         # Global styles and Tailwind imports
└── main.tsx          # App entry point
```

## Commands

```bash
pnpm dev           # Start dev server (Vite)
pnpm build         # Production build
pnpm typecheck     # Run TypeScript checks
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
pnpm storybook     # Start Storybook on :6006
```

## Prettier

Run `pnpm format` to format code with Prettier.

### Import Ordering

Imports are automatically sorted using [@ianvs/prettier-plugin-sort-imports](https://github.com/IanVS/prettier-plugin-sort-imports).

| Order | Group            | Pattern                | Examples                                    |
| ----- | ---------------- | ---------------------- | ------------------------------------------- |
| 1     | React core       | `react`, `react-dom`   | `import React from 'react'`                 |
| 2     | Framework        | `@tanstack/*`          | `@tanstack/react-router`, `react-query`     |
| 3     | tRPC             | `@trpc/*`              | `@trpc/client`, `@trpc/react-query`         |
| 4     | Third-party      | All other externals    | `zod`, `react-hook-form`, `lucide-react`    |
|       | *(blank line)*   |                        |                                             |
| 5     | Internal aliases | `@/*`                  | `@/lib/utils`, `@/components/ui`            |
|       | *(blank line)*   |                        |                                             |
| 6     | Relative imports | `./`, `../`            | `./App`, `../types`                         |
| 7     | CSS              | `*.css`                | `./index.css` (kept last for cascade order) |

Type imports are combined inline with value imports (e.g., `import { type User, useAuth }`). Specifiers within each import statement are sorted alphabetically.

## Environment Variables

Vite exposes environment variables prefixed with `VITE_` to the client. Configure in the repo root `/.env` file:

| Variable       | Description            | Default                 |
| -------------- | ---------------------- | ----------------------- |
| `VITE_API_URL` | Backend server API URL | `http://localhost:3001` |

## Documentation

| Topic                      | Location                                             |
| -------------------------- | ---------------------------------------------------- |
| Feature module conventions | [`src/features/README.md`](src/features/README.md)   |
| Routing and auth flow      | [`src/routes/README.md`](src/routes/README.md)       |

## Adding New Features

See [`src/features/README.md`](src/features/README.md) for the complete guide on:
- Creating feature modules
- Page and component organization
- Naming conventions
- Barrel exports
- Storybook stories
