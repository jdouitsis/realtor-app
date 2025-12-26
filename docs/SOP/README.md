# Standard Operating Procedures

This directory contains SOPs for common repository-level tasks.

## Index

| SOP                                                            | When to Use                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------- |
| [sop-turbo-pack.md](./sop-turbo-pack.md)                       | Adding a new repo-level command (lint, test, build, etc.)        |
| [sop-trpc-error-handling.md](./sop-trpc-error-handling.md)     | Handling tRPC errors, debugging API issues, adding error codes   |

## When to Consult SOPs

- **Adding a new script** that should run across the monorepo → `sop-turbo-pack.md`
- **Setting up a new tool** (linter, formatter, test runner) → `sop-turbo-pack.md`
- **Modifying git hooks** → `sop-turbo-pack.md`
- **Handling tRPC errors** → `sop-trpc-error-handling.md`
- **Adding custom error codes** → `sop-trpc-error-handling.md`
- **Debugging API issues** → `sop-trpc-error-handling.md`
