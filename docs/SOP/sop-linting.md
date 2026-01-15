# Linting Setup Guide

This document explains the complete linting configuration for an npm monorepo using Turborepo orchestration, oxlint + ESLint (flat config), and lint-staged with Husky git hooks.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Root Level                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  package.json                                                               │
│    └─ "lint": "turbo lint"  ←── Delegates to Turborepo                     │
│    └─ "workspaces": ["apps/*", "packages/*"]  ←── npm workspaces           │
│                                                                             │
│  turbo.json                                                                 │
│    └─ "lint": { "dependsOn": ["^lint"] }  ←── Runs lint in all packages   │
│                                                                             │
│  .husky/pre-commit                                                          │
│    └─ npm run lint-staged  ←── Triggers lint-staged via Turbo              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│         apps/web                │ │        apps/server              │
├─────────────────────────────────┤ ├─────────────────────────────────┤
│  package.json                   │ │  package.json                   │
│    └─ "lint": "oxlint && eslint"│ │    └─ "lint": "oxlint && eslint"│
│                                 │ │                                 │
│  eslint.config.js               │ │  eslint.config.js               │
│    └─ Flat config with TS      │ │    └─ Flat config with TS      │
│                                 │ │                                 │
│  .lintstagedrc                  │ │  .lintstagedrc                  │
│    └─ Per-file lint rules      │ │    └─ Per-file lint rules      │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

## Key Design Decisions

| Decision                   | Rationale                                                                 |
| -------------------------- | ------------------------------------------------------------------------- |
| oxlint + ESLint            | oxlint is 50-100x faster for basic rules; ESLint handles complex checks  |
| App-specific configs       | Each app has different needs (React vs Node); keeps configs focused      |
| Flat config format         | ESLint 9+ standard; explicit, composable, no cascading confusion         |
| Turbo orchestration        | Caching, parallel execution, dependency-aware task running               |
| `eslint-plugin-oxlint`     | Disables ESLint rules that oxlint already covers to avoid duplication    |

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
    "lint": "turbo lint",
    "lint-staged": "turbo lint-staged --concurrency=1",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "turbo": "^2"
  }
}
```

- Root only contains Turbo delegator scripts
- `workspaces` array defines which directories contain packages
- `--concurrency=1` for lint-staged prevents race conditions on staged files

### `turbo.json`

```json
{
  "tasks": {
    "lint": {
      "dependsOn": ["^lint"]
    },
    "lint-staged": {
      "outputs": [],
      "cache": false
    }
  }
}
```

- `dependsOn: ["^lint"]` ensures workspace dependencies are linted first
- `lint-staged` has `cache: false` because it operates on changing staged files

### `.husky/pre-commit`

```bash
npm run lint-staged
```

- Minimal hook that delegates to Turbo
- Husky 9+ uses plain shell scripts

---

## Web App Configuration (`apps/web`)

### `package.json` Scripts

```json
{
  "name": "@app/web",
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint-staged": "lint-staged"
  }
}
```

### `eslint.config.js` (Flat Config)

```javascript
import storybook from "eslint-plugin-storybook";
import js from "@eslint/js";
import globals from "globals";
import oxlint from "eslint-plugin-oxlint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "**/*.d.ts"]),
  // Storybook linting for story files
  ...storybook.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: [
          "./tsconfig.node.json",
          "./tsconfig.app.json",
          "./tsconfig.storybook.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // React-specific adjustments
      "react-refresh/only-export-components": "off",
      "react-x/no-forward-ref": "off", // shadcn/ui compatibility
      "react-x/no-context-provider": "off", // shadcn/ui compatibility
      "react-x/no-use-context": "off", // shadcn/ui compatibility

      // TypeScript adjustments
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Custom architectural rule
      "no-restricted-globals": [
        "error",
        {
          name: "localStorage",
          message:
            "Use createStorage from @/lib/storage for type-safe localStorage access.",
        },
      ],
    },
  },
  // MUST be last: disables ESLint rules that oxlint already covers
  oxlint.configs["flat/recommended"],
]);
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
    "@eslint/js": "^9.39.1",
    "eslint": "^9.39.1",
    "eslint-plugin-oxlint": "^1.35.0",
    "eslint-plugin-react-dom": "^2.3.13",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "eslint-plugin-react-x": "^2.3.13",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "eslint-plugin-storybook": "^10.1.10",
    "globals": "^16.5.0",
    "lint-staged": "^16.2.7",
    "oxlint": "^1.35.0",
    "typescript-eslint": "^8.46.4"
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
    "lint": "oxlint && eslint .",
    "lint-staged": "lint-staged"
  }
}
```

### `eslint.config.js` (Flat Config)

```javascript
import js from "@eslint/js";
import globals from "globals";
import oxlint from "eslint-plugin-oxlint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "drizzle.config.ts", "vitest.config.ts"]),
  {
    files: ["**/*.ts"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // TypeScript adjustments
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Logging enforcement
      "no-console": "error",

      // Environment variable access restriction
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'MemberExpression[object.name="process"][property.name="env"]',
          message:
            'Direct process.env access is not allowed. Import { env } from "./env" instead.',
        },
      ],
    },
  },
  // MUST be last: disables ESLint rules that oxlint already covers
  oxlint.configs["flat/recommended"],
]);
```

### `.lintstagedrc`

```json
{
  "src/**/*.ts": [
    "eslint --fix",
    "prettier --write",
    "vitest related --run --passWithNoTests"
  ],
  "src/**/*.json": ["prettier --write"]
}
```

Note: Server lint-staged also runs related tests for changed files.

### Dependencies

```json
{
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "eslint": "^9.39.1",
    "eslint-plugin-oxlint": "^1.35.0",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "globals": "^16.5.0",
    "lint-staged": "^16.2.7",
    "oxlint": "^1.35.0",
    "typescript-eslint": "^8.46.4"
  }
}
```

---

## Important Rules Explained

### Both Apps

| Rule                                    | Purpose                                                            |
| --------------------------------------- | ------------------------------------------------------------------ |
| `simple-import-sort/imports`            | Enforces consistent, deterministic import ordering                 |
| `simple-import-sort/exports`            | Enforces consistent export ordering                                |
| `@typescript-eslint/no-unused-vars`     | Catches dead code; `^_` prefix allows intentional unused variables |
| `@typescript-eslint/only-throw-error`   | Disabled because tRPC/custom errors may not extend Error           |
| `@typescript-eslint/require-await`      | Disabled for async function signature consistency                  |
| `recommendedTypeChecked`                | Type-aware linting (requires `project` in parserOptions)           |

### Web App Only

| Rule                                     | Purpose                                                         |
| ---------------------------------------- | --------------------------------------------------------------- |
| `react-hooks/rules-of-hooks`             | Enforces Rules of Hooks (included in recommended)               |
| `react-hooks/exhaustive-deps`            | Validates effect dependencies (included in recommended)         |
| `react-refresh/only-export-components`   | Disabled - too strict for re-exporting from index files         |
| `react-x/no-forward-ref`                 | Disabled for shadcn/ui compatibility (uses forwardRef)          |
| `react-dom/no-unknown-property`          | Catches typos in DOM properties                                 |
| `no-restricted-globals` (localStorage)   | Forces type-safe storage wrapper instead of raw localStorage    |
| `storybook/...`                          | Storybook-specific rules for story files                        |

### Server Only

| Rule                    | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `no-console`            | Forces structured logging via pino instead of console.log           |
| `no-restricted-syntax`  | Prevents direct `process.env` access; enforces validated env module |

---

## The oxlint + ESLint Strategy

### Why Both?

1. **oxlint** (Rust-based): Extremely fast, handles ~300 common rules
2. **ESLint**: Slower but handles complex/type-aware rules that oxlint can't

### How They Work Together

```bash
# In each app's lint script:
"lint": "oxlint && eslint ."
```

1. oxlint runs first (fast pass)
2. If oxlint passes, ESLint runs (thorough pass)
3. `eslint-plugin-oxlint` disables ESLint rules that oxlint already handles

### Critical: `eslint-plugin-oxlint` Placement

```javascript
export default defineConfig([
  // ... all your configs ...

  // MUST be last
  oxlint.configs["flat/recommended"],
]);
```

This config must be **last** because it disables ESLint rules. If placed earlier, subsequent configs might re-enable them.

---

## Setup Steps for a New Monorepo

### 1. Root Setup

```bash
# Initialize
npm init -y

# Configure workspaces in package.json (see below)

# Install root dependencies
npm install --save-dev turbo husky

# Setup Husky
npx husky init
echo "npm run lint-staged" > .husky/pre-commit
```

Update root `package.json`:

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "lint": "turbo lint",
    "lint-staged": "turbo lint-staged --concurrency=1",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "turbo": "^2"
  }
}
```

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "lint": {
      "dependsOn": ["^lint"]
    },
    "lint-staged": {
      "outputs": [],
      "cache": false
    }
  }
}
```

### 2. Per-App Setup

```bash
cd apps/your-app

# Install dependencies
npm install --save-dev \
  eslint \
  @eslint/js \
  typescript-eslint \
  globals \
  oxlint \
  eslint-plugin-oxlint \
  eslint-plugin-simple-import-sort \
  lint-staged

# For React apps, also add:
npm install --save-dev \
  eslint-plugin-react-hooks \
  eslint-plugin-react-refresh \
  eslint-plugin-react-x \
  eslint-plugin-react-dom
```

Add to app's `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint-staged": "lint-staged"
  }
}
```

Create `eslint.config.js` (see examples above for web/server templates).

Create `.lintstagedrc`:

```json
{
  "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

### 3. TypeScript Project References

For type-aware linting, ensure `parserOptions.project` points to your tsconfig(s):

```javascript
parserOptions: {
  project: ['./tsconfig.json'],
  tsconfigRootDir: import.meta.dirname,
}
```

### 4. Referencing Workspace Packages

In npm workspaces, reference other packages by their name:

```json
{
  "dependencies": {
    "@app/shared": "*"
  }
}
```

Then run `npm install` from the root to link them.

---

## Troubleshooting

### "Parsing error: Cannot read file tsconfig.json"

- Ensure `tsconfigRootDir: import.meta.dirname` is set
- Verify the `project` paths exist and are relative to the eslint.config.js file

### oxlint and ESLint reporting the same error

- Ensure `oxlint.configs['flat/recommended']` is **last** in your config array
- This disables ESLint rules that oxlint already covers

### lint-staged running on wrong files

- Check that glob patterns in `.lintstagedrc` match your source structure
- Patterns are relative to the package root, not the monorepo root

### Pre-commit hook not running

```bash
# Reinstall husky hooks
npx husky install
chmod +x .husky/pre-commit
```

### npm workspace dependency issues

```bash
# Reinstall all dependencies from root
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

---

## Quick Reference

| Command                         | Scope           | Description                           |
| ------------------------------- | --------------- | ------------------------------------- |
| `npm run lint`                  | All packages    | Run full lint via Turbo               |
| `npm run lint-staged`           | Staged files    | Run lint on staged files (pre-commit) |
| `npm run lint -w @app/web`      | Single package  | Run lint for web app only             |

| File                    | Location        | Purpose                               |
| ----------------------- | --------------- | ------------------------------------- |
| `turbo.json`            | Root            | Task orchestration configuration      |
| `eslint.config.js`      | Each app        | ESLint flat config                    |
| `.lintstagedrc`         | Each app        | Per-file lint rules for staged files  |
| `.husky/pre-commit`     | Root            | Git pre-commit hook                   |
