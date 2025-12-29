# Standard Operating Procedures

This directory contains SOPs for common repository-level tasks.

## Index

| SOP                                                            | When to Use                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------- |
| [sop-database-migrations.md](./sop-database-migrations.md)     | Schema changes, adding tables, Railway deployment migrations     |
| [sop-local-storage.md](./sop-local-storage.md)                 | Adding localStorage keys, using useStorage hook, cross-tab sync  |
| [sop-logging.md](./sop-logging.md)                             | Server logging, using ctx.log, redaction, troubleshooting        |
| [sop-staging-promotion.md](./sop-staging-promotion.md)         | How staging is auto-updated from main, manual sync               |
| [sop-trpc-error-handling.md](./sop-trpc-error-handling.md)     | Handling tRPC errors, debugging API issues, adding error codes   |
| [sop-turbo-pack.md](./sop-turbo-pack.md)                       | Adding a new repo-level command (lint, test, build, etc.)        |

## When to Consult SOPs

- **Changing database schema** → `sop-database-migrations.md`
- **Adding new tables** → `sop-database-migrations.md`
- **Deploying schema changes to Railway** → `sop-database-migrations.md`
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
