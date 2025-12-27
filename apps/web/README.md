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
pnpm lint          # Run oxlint, then ESLint
pnpm format        # Format with Prettier
pnpm storybook     # Start Storybook on :6006
```

## Linting

The app uses a two-tier linting setup for optimal performance:

1. **oxlint** - Rust-based linter (50-100x faster), runs first for quick feedback
2. **ESLint** - Runs second for type-checked rules and plugins oxlint doesn't cover

### Why Both?

| Linter  | Strengths                                            |
| ------- | ---------------------------------------------------- |
| oxlint  | Speed, core JS/TS rules, basic React hooks           |
| ESLint  | Type-checked rules, import sorting, React refresh/X  |

### Configuration

- `eslint.config.js` - ESLint flat config with `eslint-plugin-oxlint` to disable overlapping rules
- oxlint uses sensible defaults (no config file needed)

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
