---
name: sop
description: Write or modify Standard Operating Procedures (SOPs). Use when creating step-by-step guides, documenting workflows, modifying existing SOPs, or when the user mentions SOP, procedure, how-to guide, or asks to document how to do something.
---

# SOP Writer

Write and maintain Standard Operating Procedures in `docs/SOP/`.

## When to Use

- Documenting a repeatable process or workflow
- Creating step-by-step guides for common tasks
- Recording commands and procedures for future reference
- Modifying or updating existing SOPs in `docs/SOP/`
- Adding new sections, commands, or troubleshooting steps to existing procedures

## File Naming

```
docs/SOP/sop-<topic>.md
```

Example: `docs/SOP/sop-database-migrations.md`

## Template

```markdown
# SOP: <Title>

Brief description of what this SOP covers.

## Architecture

```
Visual diagram showing the workflow
    ↓
Step 1
    ↓
Step 2
    ↓
Result
```

## Key Files

| File              | Purpose                    |
| ----------------- | -------------------------- |
| `path/to/file`    | What this file does        |
| `another/file`    | Its purpose                |

## Commands

Run from repository root:

| Command           | Purpose                    |
| ----------------- | -------------------------- |
| `pnpm <command>`  | What it does               |

## Workflow

### Step 1: Description

Detailed instructions for this step.

```bash
# Command examples
pnpm example-command
```

### Step 2: Description

More instructions.

## Examples

### Example: Common Use Case

1. Step one
2. Step two
3. Step three

## Troubleshooting

### "Error message"

**Cause:** Why this happens.

**Fix:** How to resolve it.

## Best Practices

1. First best practice
2. Second best practice
3. Third best practice
```

## After Writing

Update `docs/SOP/README.md` to add the new SOP:

1. Add to the Index table:
```markdown
| SOP                                    | When to Use                              |
| -------------------------------------- | ---------------------------------------- |
| [sop-<topic>.md](./sop-<topic>.md)     | Brief description of when to use         |
```

2. Add to the "When to Consult SOPs" section with relevant trigger scenarios.

## Guidelines

1. Be **procedural** - focus on step-by-step instructions
2. Include **commands** that can be copy-pasted
3. Add **troubleshooting** for common errors
4. Use **tables** for file references and command lists
5. Include **examples** for complex workflows
6. Keep instructions **actionable** and specific
