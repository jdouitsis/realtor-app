# Finance App

A finance application built as a pnpm monorepo with Turborepo orchestration.

## Tech Stack

- **Frontend**: React 19, Vite, TanStack Router, TanStack Query, TailwindCSS 3
- **Backend**: Express, tRPC
- **UI Components**: shadcn/ui (Radix primitives + CVA)
- **Forms**: react-hook-form + zod
- **Tooling**: TypeScript, ESLint, Prettier, Husky

## Monorepo Structure

```
/
├── apps/
│   ├── web/             # React frontend application
│   └── server/          # Express + tRPC backend
├── docs/SOP/            # Standard operating procedures
├── turbo.json           # Turborepo task configuration
└── package.json         # Root scripts
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development servers
pnpm dev
```

## Commands

| Command          | Description                |
| ---------------- | -------------------------- |
| `pnpm dev`       | Start all dev servers      |
| `pnpm build`     | Build for production       |
| `pnpm typecheck` | Run TypeScript checks      |
| `pnpm lint`      | Run ESLint                 |
| `pnpm format`    | Format with Prettier       |
| `pnpm storybook` | Start Storybook            |

## Environment Variables

See `.env.example` for required environment variables:

| Variable       | Description                    | Example                   |
| -------------- | ------------------------------ | ------------------------- |
| `PORT`         | Server port                    | `3001`                    |
| `NODE_ENV`     | Environment mode               | `development`             |
| `WEB_URL`      | Frontend URL (for CORS)        | `http://localhost:5173`   |
| `VITE_API_URL` | Backend API URL (for frontend) | `http://localhost:3001`   |

## Deploying with Railway

This monorepo can be deployed to [Railway](https://railway.app) with separate services for the web and server apps.

### Project Setup

1. Create a new Railway project
2. Add two services from the same GitHub repo:
   - **Server**: Set root directory to `apps/server`
   - **Web**: Set root directory to `apps/web`

### Environment Variables with Railway References

When configuring environment variables that reference other Railway services, you must manually prefix URLs with `https://`.

Railway's variable references (e.g., `${{server.RAILWAY_PUBLIC_DOMAIN}}`) only provide the domain name without the protocol. You need to construct the full URL yourself.

**Example Configuration:**

For the **web** service:
```
VITE_API_URL=https://${{server.RAILWAY_PUBLIC_DOMAIN}}
```

For the **server** service:
```
WEB_URL=https://${{web.RAILWAY_PUBLIC_DOMAIN}}
```

**Why this matters:**

| What you might expect           | What Railway actually provides |
| ------------------------------- | ------------------------------ |
| `https://my-server.up.railway.app` | `my-server.up.railway.app`     |

Without the `https://` prefix, your application will fail to connect or have CORS issues because the URLs won't be valid.

### Service Configuration

Each app has its own deployment config:

- `apps/server/nixpacks.toml` - Server build/start configuration
- `apps/web/nixpacks.toml` - Web build/start configuration (if needed)
