# Architecture Documentation

This directory contains documentation describing the architectural patterns and systems used in this project.

## Index

| Document                               | When to Use                                               |
| -------------------------------------- | --------------------------------------------------------- |
| [design-system.md](./design-system.md) | Understanding UI components, shadcn/ui, theming, Tailwind |

## When to Consult Architecture Docs

- **Adding UI components** → `design-system.md`
- **Understanding shadcn/ui patterns** → `design-system.md`
- **Working with Tailwind theming** → `design-system.md`
- **Using CVA for component variants** → `design-system.md`
- **Form integration patterns** → `design-system.md`

## Adding New Architecture Docs

When documenting a new architectural pattern or system:

1. Create a new `.md` file in this directory with a descriptive name
2. Include these sections:
   - **Overview** - What the system/pattern is and why it exists
   - **How It Works** - Technical explanation with code examples
   - **Usage** - How to use it in practice
   - **Best Practices** - Do's and don'ts
3. Add an entry to the Index table above
4. Add relevant entries to the "When to Consult" section
