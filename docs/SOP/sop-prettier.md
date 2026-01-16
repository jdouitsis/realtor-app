# Prettier Setup Guide

This document explains the complete Prettier configuration for an npm monorepo using Turborepo orchestration and lint-staged integration for pre-commit formatting.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Root Level                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  package.json                                                               │
│    └─ "format": "turbo format"  ←── Delegates to Turborepo                 │
│    └─ "format:check": "turbo format:check"  ←── CI verification            │
│    └─ "workspaces": ["apps/*", "packages/*"]  ←── npm workspaces           │
│                                                                             │
│  turbo.json                                                                 │
│    └─ "format": { "cache": false }  ←── No caching (modifies files)        │
│    └─ "format:check": { }  ←── Cacheable (read-only)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│         apps/web                │ │        apps/server              │
├─────────────────────────────────┤ ├─────────────────────────────────┤
│  package.json                   │ │  package.json                   │
│    └─ "format": "prettier ..."  │ │    └─ "format": "prettier ..."  │
│                                 │ │                                 │
│  .prettierrc                    │ │  .prettierrc                    │
│    └─ Formatting rules          │ │    └─ Formatting rules          │
│                                 │ │                                 │
│  .prettierignore                │ │  .prettierignore (optional)     │
│    └─ Files to skip             │ │    └─ Files to skip             │
│                                 │ │                                 │
│  .lintstagedrc                  │ │  .lintstagedrc                  │
│    └─ "prettier --write"        │ │    └─ "prettier --write"        │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

## Key Design Decisions

| Decision                   | Rationale                                                                 |
| -------------------------- | ------------------------------------------------------------------------- |
| App-specific configs       | Allows different file types per app (e.g., TSX in web, only TS in server)|
| Turbo orchestration        | Parallel execution across packages, caching for `format:check`           |
| lint-staged integration    | Format only staged files on commit, not entire codebase                  |
| Separate format/check      | `format` for local dev, `format:check` for CI (fails on unformatted)     |

---

## Root Level Configuration

### `package.json`

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "format": "turbo format",
    "format:check": "turbo format:check",
    "lint-staged": "turbo lint-staged --concurrency=1",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "turbo": "^2"
  }
}
```

- `format` modifies files (for local development)
- `format:check` exits non-zero if files need formatting (for CI)
- No Prettier at root level - each app owns its config

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "format": {
      "outputs": [],
      "cache": false
    },
    "format:check": {
      "outputs": []
    },
    "lint-staged": {
      "outputs": [],
      "cache": false
    }
  }
}
```

- `format` has `cache: false` because it modifies files
- `format:check` is cacheable (same input = same result)
- Both have empty `outputs` since they don't produce build artifacts

---

## Web App Configuration (`apps/web`)

### `package.json` Scripts

```json
{
  "name": "@app/web",
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "lint-staged": "lint-staged"
  }
}
```

### `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### `.prettierignore`

```
node_modules
dist
*.gen.ts
```

### `.lintstagedrc`

```json
{
  "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "src/**/*.{json,css,md}": ["prettier --write"]
}
```

### Dependencies

```json
{
  "devDependencies": {
    "prettier": "^3.7.4",
    "lint-staged": "^16.2.7"
  }
}
```

---

## Server App Configuration (`apps/server`)

### `package.json` Scripts

```json
{
  "name": "@app/server",
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,json}\"",
    "lint-staged": "lint-staged"
  }
}
```

Note: Server only formats `.ts` and `.json` (no TSX, CSS, or MD).

### `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### `.lintstagedrc`

```json
{
  "src/**/*.ts": ["eslint --fix", "prettier --write"],
  "src/**/*.json": ["prettier --write"]
}
```

### Dependencies

```json
{
  "devDependencies": {
    "prettier": "^3.7.4",
    "lint-staged": "^16.2.7"
  }
}
```

---

## Configuration Options Explained

### Core Options

| Option           | Value     | Description                                              |
| ---------------- | --------- | -------------------------------------------------------- |
| `semi`           | `false`   | No semicolons at end of statements                       |
| `singleQuote`    | `true`    | Use single quotes instead of double quotes               |
| `tabWidth`       | `2`       | 2 spaces per indentation level                           |
| `trailingComma`  | `"es5"`   | Trailing commas where valid in ES5 (objects, arrays)     |
| `printWidth`     | `100`     | Line wrap at 100 characters                              |

### Other Useful Options

| Option              | Default   | Description                                           |
| ------------------- | --------- | ----------------------------------------------------- |
| `useTabs`           | `false`   | Use tabs instead of spaces                            |
| `bracketSpacing`    | `true`    | Spaces inside object braces: `{ foo: bar }`           |
| `arrowParens`       | `"always"`| Parens around single arrow function params: `(x) =>`  |
| `endOfLine`         | `"lf"`    | Line ending style (lf, crlf, cr, auto)                |
| `jsxSingleQuote`    | `false`   | Use single quotes in JSX                              |
| `proseWrap`         | `"preserve"` | How to wrap markdown text                          |

---

## Integration with ESLint

Prettier handles formatting, ESLint handles code quality. They work together via lint-staged:

```json
{
  "src/**/*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

**Order matters:**
1. ESLint runs first with `--fix` to auto-fix linting issues
2. Prettier runs second to format the result

This ensures ESLint's fixes don't conflict with Prettier's formatting.

### Avoiding Conflicts

If ESLint has formatting rules that conflict with Prettier, either:

1. **Disable ESLint formatting rules** (recommended):
   - Use `eslint-config-prettier` to turn off conflicting rules
   - Or manually disable rules like `indent`, `quotes`, `semi`

2. **Use eslint-plugin-prettier** (not recommended):
   - Runs Prettier as an ESLint rule
   - Slower and more complex than running separately

This setup uses option 1 implicitly by not enabling conflicting ESLint rules.

---

## Pre-commit Hook Integration

### `.husky/pre-commit`

```bash
npm run lint-staged
```

### How It Works

1. Developer stages files with `git add`
2. On commit, Husky triggers `npm run lint-staged`
3. Turbo runs `lint-staged` in each package
4. lint-staged runs Prettier only on staged files
5. If formatting changes, the changes are included in the commit

### Why lint-staged?

- **Speed**: Only formats changed files, not entire codebase
- **Automatic**: Formatting happens without developer thinking about it
- **Consistent**: Every commit is properly formatted

---

## CI Integration

Add a format check step to your CI pipeline:

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run format:check
```

### What Happens

- `format:check` uses `prettier --check` which:
  - Exits with code 0 if all files are formatted
  - Exits with code 1 if any files need formatting
  - Lists unformatted files in output

---

## Setup Steps for a New Monorepo

### 1. Root Setup

```bash
# Initialize (if not already done)
npm init -y

# Install Turbo (if not already installed)
npm install --save-dev turbo
```

Add to root `package.json`:

```json
{
  "scripts": {
    "format": "turbo format",
    "format:check": "turbo format:check"
  }
}
```

Add to `turbo.json`:

```json
{
  "tasks": {
    "format": {
      "outputs": [],
      "cache": false
    },
    "format:check": {
      "outputs": []
    }
  }
}
```

### 2. Per-App Setup

```bash
cd apps/your-app

# Install Prettier
npm install --save-dev prettier lint-staged
```

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Create `.prettierignore`:

```
node_modules
dist
```

Add to app's `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",
    "lint-staged": "lint-staged"
  }
}
```

Add to `.lintstagedrc`:

```json
{
  "src/**/*.{ts,tsx}": ["prettier --write"],
  "src/**/*.{json,css,md}": ["prettier --write"]
}
```

### 3. Consistent Config Across Apps

To ensure all apps use the same Prettier config, you have two options:

**Option A: Duplicate config (simple)**
- Copy `.prettierrc` to each app
- Manually keep them in sync

**Option B: Shared config package (scalable)**

Create `packages/prettier-config/index.json`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Create `packages/prettier-config/package.json`:

```json
{
  "name": "@app/prettier-config",
  "version": "1.0.0",
  "main": "index.json"
}
```

In each app's `package.json`:

```json
{
  "prettier": "@app/prettier-config"
}
```

Then add the dependency:

```json
{
  "devDependencies": {
    "@app/prettier-config": "*"
  }
}
```

---

## Troubleshooting

### "No files matching the pattern were found"

- Check that the glob pattern matches your file structure
- Ensure the path is quoted: `"src/**/*.ts"` not `src/**/*.ts`
- Verify files aren't excluded by `.prettierignore`

### Formatting conflicts with ESLint

- Ensure ESLint doesn't have formatting rules enabled
- Run ESLint before Prettier in lint-staged
- Consider using `eslint-config-prettier` to disable conflicts

### Format changes not included in commit

- Ensure lint-staged is configured to run `prettier --write`
- Check that Husky hook is executable: `chmod +x .husky/pre-commit`
- Verify staged files match lint-staged patterns

### Different formatting on different machines

- Ensure all developers use the same Prettier version
- Lock the version in `package.json` (not `^3.7.4` but `3.7.4`)
- Or use `package-lock.json` / `npm ci` for consistent installs

### Slow formatting

- Use more specific glob patterns (e.g., `src/**/*.ts` not `**/*.ts`)
- Add generated/vendor files to `.prettierignore`
- Use lint-staged for incremental formatting

---

## Quick Reference

| Command                           | Scope           | Description                           |
| --------------------------------- | --------------- | ------------------------------------- |
| `npm run format`                  | All packages    | Format all files via Turbo            |
| `npm run format:check`            | All packages    | Check formatting (CI)                 |
| `npm run format -w @app/web`      | Single package  | Format web app only                   |

| File                | Location        | Purpose                               |
| ------------------- | --------------- | ------------------------------------- |
| `turbo.json`        | Root            | Task orchestration configuration      |
| `.prettierrc`       | Each app        | Prettier formatting rules             |
| `.prettierignore`   | Each app        | Files to exclude from formatting      |
| `.lintstagedrc`     | Each app        | Pre-commit formatting config          |

| Script          | Tool Flag       | Behavior                                      |
| --------------- | --------------- | --------------------------------------------- |
| `format`        | `--write`       | Modifies files in place                       |
| `format:check`  | `--check`       | Reports unformatted files, exits non-zero     |
