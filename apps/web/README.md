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
