---
name: commit
description: Create a git commit with a properly formatted message following project conventions. Use when the user wants to commit changes, asks to commit, or types /commit.
---

# Commit

Create git commits following the project's Conventional Commits format.

## Commit Message Format

```
<type>(<app>:<area>): <description>
```

| Part            | Description                                  | Examples                          |
| --------------- | -------------------------------------------- | --------------------------------- |
| `<type>`        | The type of change                           | `feat`, `fix`, `docs`, `refactor` |
| `<app>`         | Which app in the monorepo                    | `web`, `server`                   |
| `<area>`        | Specific area within the app                 | `auth`, `prettier`, `trpc`, `ui`  |
| `<description>` | Short description of the change (imperative) | `add login form validation`       |

## Commit Types

| Type       | When to Use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature or functionality                            |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only changes                              |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore`    | Maintenance tasks, dependencies, tooling                |
| `test`     | Adding or updating tests                                |
| `style`    | Formatting, whitespace (no code logic changes)          |

## Examples

```
feat(web:auth): add login form validation
fix(server:trpc): handle null user in me procedure
docs(web:prettier): document import ordering rules
refactor(web:ui): extract Button variants to separate file
chore(server:deps): update express to v5
```

For changes spanning multiple areas or the whole app, omit the area:

```
feat(web): add dark mode support
fix(server): update all procedures to use new context
```

For repo-wide changes, omit both:

```
chore: update pnpm to v9
docs: add contributing guide
```

## Workflow

1. Run `git status` to see all changed files
2. Run `git diff` to review staged and unstaged changes
3. Stage relevant files with `git add`
4. Create commit with properly formatted message
5. Verify with `git status`

## Guidelines

1. Use **imperative mood** in descriptions ("add" not "added" or "adds")
2. Keep the first line under **72 characters**
3. Description should be **lowercase** (no capital at start)
4. **No period** at the end of the description
5. Be **specific** about what changed and why
6. Group related changes into a **single commit**
7. Never end with the co-author line:
   ```
   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```

## Commit Command Template

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <title>

<description>

EOF
)"
```

I repeat. NEVER include a Co-authored-by tagging yourself or anyone else. If you do, you will be shot dead on the spot.
