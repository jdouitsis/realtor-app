# SOP: Mono Repo Command Setup

This document explains how commands are structured in this monorepo and provides steps for adding new repo-level commands.

## Overview

All repo-level commands follow a consistent pattern using Turborepo for orchestration:

```
Root package.json → turbo.json → apps/web/package.json
```

- **Root `package.json`**: Contains only turbo-delegating scripts
- **`turbo.json`**: Defines task configuration (caching, dependencies, outputs)
- **`apps/web/package.json`**: Contains the actual command implementation

## Current Commands

| Command | Root Script | Turbo Task | App Script |
|---------|-------------|------------|------------|
| `pnpm dev` | `turbo dev` | `dev` | `vite` |
| `pnpm build` | `turbo build` | `build` | `vite build` |
| `pnpm typecheck` | `turbo typecheck` | `typecheck` | `tsc -b` |
| `pnpm lint` | `turbo lint` | `lint` | `eslint .` |
| `pnpm format` | `turbo format` | `format` | `prettier --write ...` |
| `pnpm format:check` | `turbo format:check` | `format:check` | `prettier --check ...` |
| `pnpm lint-staged` | `turbo lint-staged` | `lint-staged` | `lint-staged` |
| `pnpm storybook` | `turbo storybook` | `storybook` | `storybook dev -p 6006` |

## Adding a New Command

Follow these steps to add a new repo-level command:

### Step 1: Add the script to `apps/web/package.json`

Add the actual command implementation:

```json
{
  "scripts": {
    "my-command": "actual-command-here"
  }
}
```

### Step 2: Add the task to `turbo.json`

Configure how Turbo should run the task:

```json
{
  "tasks": {
    "my-command": {
      "outputs": [],
      "cache": false
    }
  }
}
```

#### Task Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `outputs` | Files/dirs to cache | `["dist/**"]` for build artifacts, `[]` for none |
| `cache` | Whether to cache results | `false` for dev servers, formatters; `true` for builds |
| `dependsOn` | Tasks that must run first | `["^build", "typecheck"]` |
| `persistent` | Long-running process | `true` for dev servers, storybook |

#### Common Patterns

**Build tasks** (cacheable, has outputs):
```json
{
  "build": {
    "dependsOn": ["^build", "typecheck"],
    "outputs": ["dist/**"]
  }
}
```

**Dev servers** (persistent, no cache):
```json
{
  "dev": {
    "cache": false,
    "persistent": true
  }
}
```

**Linting/formatting** (no outputs, may or may not cache):
```json
{
  "lint": {
    "dependsOn": ["^lint"]
  },
  "format": {
    "outputs": [],
    "cache": false
  }
}
```

### Step 3: Add the script to root `package.json`

Add a turbo-delegating script:

```json
{
  "scripts": {
    "my-command": "turbo my-command"
  }
}
```

### Step 4: (Optional) Wire up to Husky

If the command should run on git hooks, update the appropriate hook in `.husky/`:

```bash
# .husky/pre-commit
pnpm my-command
```

## Example: Adding a Test Command

### 1. `apps/web/package.json`
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 2. `turbo.json`
```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 3. Root `package.json`
```json
{
  "scripts": {
    "test": "turbo test",
    "test:watch": "turbo test:watch"
  }
}
```

## Key Principles

1. **App-specific configs live in `apps/web/`** - Prettier, ESLint, lint-staged configs all belong in the app
2. **Root only has turbo orchestration** - No direct tool invocations, just `turbo <task>`
3. **Husky lives at root** - Git hooks are repo-level, but they call turbo commands
4. **Use `dependsOn` for task ordering** - Let Turbo handle dependencies between tasks
5. **Cache when possible** - Only disable caching for dev servers and commands that modify files
