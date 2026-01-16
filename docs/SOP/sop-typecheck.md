# TypeScript Type Checking Setup Guide

This document explains the complete TypeScript type checking configuration for an npm monorepo using Turborepo orchestration.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Root Level                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  package.json                                                               │
│    └─ "typecheck": "turbo typecheck"  ←── Delegates to Turborepo           │
│    └─ "workspaces": ["apps/*", "packages/*"]  ←── npm workspaces           │
│                                                                             │
│  turbo.json                                                                 │
│    └─ "typecheck": { "dependsOn": ["^typecheck"] }  ←── Dependency order   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
┌───────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   packages/shared     │ │     apps/server     │ │      apps/web       │
├───────────────────────┤ ├─────────────────────┤ ├─────────────────────┤
│  tsconfig.json        │ │  tsconfig.json      │ │  tsconfig.json      │
│    └─ composite: true │ │    └─ Single config │ │    └─ References    │
│    └─ Shared types    │ │                     │ │                     │
│                       │ │                     │ │  tsconfig.app.json  │
│                       │ │                     │ │    └─ App source    │
│                       │ │                     │ │                     │
│                       │ │                     │ │  tsconfig.node.json │
│                       │ │                     │ │    └─ Config files  │
│                       │ │                     │ │                     │
│                       │ │                     │ │  tsconfig.storybook │
│                       │ │                     │ │    └─ Story files   │
└───────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

## Key Design Decisions

| Decision                     | Rationale                                                              |
| ---------------------------- | ---------------------------------------------------------------------- |
| Per-app tsconfig             | Each app has different targets (browser vs Node), libs, and includes  |
| Project references (web)     | Separate configs for app, node configs, and Storybook                 |
| `--noEmit` for typecheck     | Type checking only, bundler handles actual compilation                |
| `dependsOn: ["^typecheck"]`  | Shared packages must typecheck before apps that depend on them        |
| Strict mode everywhere       | Catches more bugs at compile time                                     |

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
    "typecheck": "turbo typecheck",
    "build": "turbo build"
  },
  "devDependencies": {
    "turbo": "^2"
  }
}
```

- No TypeScript at root level - each package owns its config
- `typecheck` delegates to Turbo for parallel execution

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "build": {
      "dependsOn": ["^build", "typecheck"],
      "outputs": ["dist/**"]
    }
  }
}
```

- `dependsOn: ["^typecheck"]` - typecheck dependencies first (e.g., shared before apps)
- `outputs: []` - typecheck produces no artifacts (just validates)
- `build` depends on `typecheck` - ensures types are valid before building

---

## Web App Configuration (`apps/web`)

The web app uses **project references** to separate different compilation contexts.

### `package.json` Scripts

```json
{
  "name": "@app/web",
  "scripts": {
    "typecheck": "tsc -p tsconfig.app.json --noEmit",
    "build": "vite build"
  }
}
```

Note: Typecheck targets `tsconfig.app.json` specifically, not the root `tsconfig.json`.

### `tsconfig.json` (Root - References Only)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.storybook.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@server/*": ["../server/src/*"]
    }
  }
}
```

- `files: []` - this config doesn't compile anything directly
- `references` - points to the actual compilation configs
- `paths` - shared path aliases for IDE support

### `tsconfig.app.json` (Application Source)

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@server/*": ["../server/src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["src/**/*.stories.tsx", "src/**/*.stories.ts"]
}
```

### `tsconfig.node.json` (Config Files)

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "tailwind.config.ts"]
}
```

- Targets Node environment (for config files)
- No DOM types, uses `node` types instead
- Includes only config files at root

### `tsconfig.storybook.json` (Storybook Files)

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.storybook.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.stories.tsx",
    "src/**/*.stories.ts",
    ".storybook/**/*.ts",
    ".storybook/**/*.tsx"
  ]
}
```

- Includes story files that `tsconfig.app.json` excludes
- Slightly relaxed linting (no `erasableSyntaxOnly`)

### Dependencies

```json
{
  "devDependencies": {
    "typescript": "~5.9.3"
  }
}
```

---

## Server App Configuration (`apps/server`)

The server uses a **single tsconfig** since all code runs in the same Node environment.

### `package.json` Scripts

```json
{
  "name": "@app/server",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "jsx": "react-jsx",
    "paths": {
      "@server/*": ["./src/*"]
    },
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- Single config for all server code
- `jsx: react-jsx` for email templates (react-email)
- `types` includes both Vitest globals and Node

### Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

---

## Shared Package Configuration (`packages/shared`)

Shared packages need special handling for cross-package type imports.

### `package.json`

```json
{
  "name": "@app/shared",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    "./*": "./src/*.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

Key options for shared packages:
- `declaration: true` - generates `.d.ts` files
- `declarationMap: true` - enables "Go to Definition" to source
- `composite: true` - required for project references

---

## Compiler Options Explained

### Target & Module

| Option              | Value       | Description                                       |
| ------------------- | ----------- | ------------------------------------------------- |
| `target`            | `ES2022`    | JS version to output (modern browsers/Node 18+)   |
| `module`            | `ESNext`    | Module system (ESM with latest features)          |
| `moduleResolution`  | `bundler`   | Resolution strategy optimized for bundlers        |
| `lib`               | varies      | Type definitions to include (DOM, ES2022, etc.)   |

### Bundler Mode Options

| Option                        | Value   | Description                                    |
| ----------------------------- | ------- | ---------------------------------------------- |
| `moduleResolution`            | `bundler` | Understands package.json exports, etc.       |
| `allowImportingTsExtensions`  | `true`  | Allow `.ts` imports (bundler resolves them)    |
| `verbatimModuleSyntax`        | `true`  | Enforces explicit `type` imports               |
| `moduleDetection`             | `force` | Treat all files as modules                     |
| `noEmit`                      | `true`  | Don't output files (bundler handles it)        |

### Strict Type Checking

| Option                          | Value   | Description                                  |
| ------------------------------- | ------- | -------------------------------------------- |
| `strict`                        | `true`  | Enable all strict type checking options      |
| `noUnusedLocals`                | `true`  | Error on unused local variables              |
| `noUnusedParameters`            | `true`  | Error on unused function parameters          |
| `noFallthroughCasesInSwitch`    | `true`  | Error on fallthrough in switch statements    |
| `noUncheckedSideEffectImports`  | `true`  | Ensure side-effect imports resolve           |
| `erasableSyntaxOnly`            | `true`  | Only allow syntax that erases completely     |

### Path Aliases

| Option    | Value                            | Description                          |
| --------- | -------------------------------- | ------------------------------------ |
| `baseUrl` | `"."`                            | Base for non-relative imports        |
| `paths`   | `{ "@/*": ["./src/*"] }`         | Path alias mappings                  |

Note: Path aliases must also be configured in your bundler (Vite, webpack, etc.).

---

## Why Project References?

The web app uses project references to handle different TypeScript contexts:

| Config                  | Environment | Files                              |
| ----------------------- | ----------- | ---------------------------------- |
| `tsconfig.app.json`     | Browser     | `src/**/*` (excluding stories)     |
| `tsconfig.node.json`    | Node        | `vite.config.ts`, etc.             |
| `tsconfig.storybook.json` | Browser   | `*.stories.tsx`, `.storybook/**`   |

**Benefits:**
- Different `lib` options per context (DOM vs Node)
- Different `types` per context (vite/client vs node)
- Faster incremental builds (only recheck changed projects)
- Clear separation of concerns

---

## CI Integration

Add type checking to your CI pipeline:

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run typecheck
```

### Integration with Build

In `turbo.json`, build depends on typecheck:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build", "typecheck"],
      "outputs": ["dist/**"]
    }
  }
}
```

This ensures:
1. Dependencies build first (`^build`)
2. Types are valid (`typecheck`)
3. Then build runs

---

## Setup Steps for a New Monorepo

### 1. Root Setup

```bash
# Initialize (if not already done)
npm init -y

# Install Turbo
npm install --save-dev turbo
```

Add to root `package.json`:

```json
{
  "scripts": {
    "typecheck": "turbo typecheck"
  }
}
```

Add to `turbo.json`:

```json
{
  "tasks": {
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    }
  }
}
```

### 2. Per-App Setup

```bash
cd apps/your-app

# Install TypeScript
npm install --save-dev typescript
```

Create `tsconfig.json` with appropriate settings (see templates above).

Add to app's `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

### 3. Shared Package Setup

For packages consumed by other packages:

```bash
cd packages/shared

npm install --save-dev typescript
```

Create `tsconfig.json` with `composite: true`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"]
}
```

### 4. Configure Path Aliases in Bundler

For Vite (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Or use `vite-tsconfig-paths` plugin:

```bash
npm install --save-dev vite-tsconfig-paths
```

```typescript
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
})
```

---

## Troubleshooting

### "Cannot find module '@/...'"

- Ensure `baseUrl` and `paths` are configured in tsconfig
- Verify bundler has matching alias configuration
- Check that `moduleResolution` is `bundler` or `node16`/`nodenext`

### "File is not under 'rootDir'"

- Ensure `include` patterns cover all source files
- Check that imports don't reference files outside `rootDir`
- For cross-package imports, use workspace dependencies

### Slow type checking

- Use `skipLibCheck: true` to skip checking node_modules
- Use project references to check only changed projects
- Use `tsBuildInfoFile` to enable incremental compilation

### Types not updating after changes

```bash
# Clear TypeScript cache
rm -rf node_modules/.tmp
rm -rf apps/*/node_modules/.tmp

# Re-run typecheck
npm run typecheck
```

### "Cannot use JSX unless '--jsx' flag is provided"

- Ensure `jsx: "react-jsx"` (or `react`) is in compilerOptions
- Verify the file is included in tsconfig's `include` pattern

### Path aliases work in IDE but fail at runtime

- Bundler needs separate alias configuration
- Use `vite-tsconfig-paths` or configure aliases manually
- For Node.js, use `tsconfig-paths` or compile with paths resolved

---

## Quick Reference

| Command                              | Scope           | Description                        |
| ------------------------------------ | --------------- | ---------------------------------- |
| `npm run typecheck`                  | All packages    | Type check via Turbo               |
| `npm run typecheck -w @app/web`      | Single package  | Type check web app only            |
| `npx tsc --noEmit`                   | Current dir     | Type check without Turbo           |

| File                    | Location           | Purpose                            |
| ----------------------- | ------------------ | ---------------------------------- |
| `turbo.json`            | Root               | Task orchestration                 |
| `tsconfig.json`         | Each package       | TypeScript configuration           |
| `tsconfig.app.json`     | Web app            | Browser source config              |
| `tsconfig.node.json`    | Web app            | Node config files config           |

| Flag          | Description                                               |
| ------------- | --------------------------------------------------------- |
| `--noEmit`    | Type check only, don't output files                       |
| `-p <file>`   | Use specific tsconfig file                                |
| `--watch`     | Watch mode for development                                |
| `--build`     | Build project references                                  |
