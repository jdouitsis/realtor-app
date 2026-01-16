# Standard Operating Procedures

This directory contains SOPs for common repository-level tasks.

## Index

| SOP                                                            | When to Use                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------- |
| [sop-database-migrations.md](./sop-database-migrations.md)     | Schema changes, adding tables, Railway deployment migrations     |
| [sop-dev-ports.md](./sop-dev-ports.md)                         | Changing dev ports (Postgres, MinIO, Vite, Server)               |
| [sop-epic-planning.md](./sop-epic-planning.md)                 | Planning epics, feature breakdown, dependency diagrams           |
| [sop-discriminated-unions.md](./sop-discriminated-unions.md)   | Type-safe unions with ts-pattern, MapToUnionWithTypeFieldAdded   |
| [sop-email-templates.md](./sop-email-templates.md)             | Creating, modifying, and previewing email templates              |
| [sop-environment-variables.md](./sop-environment-variables.md) | Adding env vars to web/server, Railway config, VITE_* variables  |
| [sop-local-storage.md](./sop-local-storage.md)                 | Adding localStorage keys, using useStorage hook, cross-tab sync  |
| [sop-logging.md](./sop-logging.md)                             | Server logging, using ctx.log, redaction, troubleshooting        |
| [sop-pagination.md](./sop-pagination.md)                       | Cursor-based pagination for list endpoints                       |
| [sop-server-redirect-keys.md](./sop-server-redirect-keys.md)   | Adding magic link redirect keys, type-safe redirects             |
| [sop-staging-promotion.md](./sop-staging-promotion.md)         | How staging is auto-updated from main, manual sync               |
| [sop-trpc-error-handling.md](./sop-trpc-error-handling.md)     | Handling tRPC errors, debugging API issues, adding error codes   |
| [sop-turbo-pack.md](./sop-turbo-pack.md)                       | Adding a new repo-level command (lint, test, build, etc.)        |

## When to Consult SOPs

- **Planning a new epic** → `sop-epic-planning.md`
- **Breaking down large features** → `sop-epic-planning.md`
- **Creating feature dependency diagrams** → `sop-epic-planning.md`
- **Changing development ports** → `sop-dev-ports.md`
- **Port conflict issues** → `sop-dev-ports.md`
- **Changing database schema** → `sop-database-migrations.md`
- **Adding new tables** → `sop-database-migrations.md`
- **Deploying schema changes to Railway** → `sop-database-migrations.md`
- **Creating type-safe unions** → `sop-discriminated-unions.md`
- **Using MapToUnionWithTypeFieldAdded** → `sop-discriminated-unions.md`
- **Exhaustive pattern matching with ts-pattern** → `sop-discriminated-unions.md`
- **Adding a new email template** → `sop-email-templates.md`
- **Modifying existing emails** → `sop-email-templates.md`
- **Previewing email templates** → `sop-email-templates.md`
- **Adding environment variables** → `sop-environment-variables.md`
- **Configuring VITE_* variables** → `sop-environment-variables.md`
- **Railway environment setup** → `sop-environment-variables.md`
- **Adding a new script** that should run across the monorepo → `sop-turbo-pack.md`
- **Setting up a new tool** (linter, formatter, test runner) → `sop-turbo-pack.md`
- **Modifying git hooks** → `sop-turbo-pack.md`
- **Handling tRPC errors** → `sop-trpc-error-handling.md`
- **Adding custom error codes** → `sop-trpc-error-handling.md`
- **Debugging API issues** → `sop-trpc-error-handling.md`
- **Adding logging to procedures** → `sop-logging.md`
- **Configuring log levels** → `sop-logging.md`
- **Redacting sensitive data in logs** → `sop-logging.md`
- **Persisting data to localStorage** → `sop-local-storage.md`
- **Adding new storage keys** → `sop-local-storage.md`
- **Cross-tab state synchronization** → `sop-local-storage.md`
- **Understanding staging sync** → `sop-staging-promotion.md`
- **Manual staging promotion** → `sop-staging-promotion.md`
- **Implementing paginated lists** → `sop-pagination.md`
- **Cursor-based pagination** → `sop-pagination.md`
- **Infinite scroll with TanStack Query** → `sop-pagination.md`
- **Adding magic link redirect destinations** → `sop-server-redirect-keys.md`
- **Type-safe redirects after authentication** → `sop-server-redirect-keys.md`
