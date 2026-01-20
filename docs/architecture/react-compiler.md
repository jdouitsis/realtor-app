# React Compiler

This project uses [React Compiler](https://react.dev/learn/react-compiler) to automatically optimize React components by adding memoization at build time.

## Configuration

React Compiler is enabled via the Vite config in `apps/web/vite.config.ts`:

```typescript
react({
  babel: {
    plugins: ['babel-plugin-react-compiler'],
  },
}),
```

The compiler runs during the build process and automatically inserts `useMemo`, `useCallback`, and `memo` equivalents where beneficial, eliminating the need for manual memoization in most cases.

## ESLint Integration

The project uses `eslint-plugin-react-hooks` which includes rules for React Compiler compatibility:

- **`react-hooks/incompatible-library`** - Warns when using APIs from libraries that return unstable references incompatible with automatic memoization

## Opting Out

When a component or file is incompatible with React Compiler, use the `'use no memo'` directive at the top of the file:

```typescript
'use no memo'

import { useReactTable } from '@tanstack/react-table'
// ...
```

This tells the compiler to skip automatic memoization for the entire file.

## Exceptions

Components and files that opt out of React Compiler optimization:

| File                                                       | Reason                                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `apps/web/src/components/composed/data-table/DataTable.tsx` | TanStack Table's `useReactTable()` returns functions that change every render and cannot be memoized safely |

When adding a new exception:

1. Add `'use no memo'` at the top of the file
2. Add an eslint-disable comment explaining why: `// eslint-disable-next-line react-hooks/incompatible-library -- <reason>`
3. Document the exception in this table

## Resources

- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [React Compiler Troubleshooting](https://react.dev/learn/react-compiler#troubleshooting)
