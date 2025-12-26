---
name: adr
description: Write or modify Architecture Decision Records (ADRs). Use when documenting technical decisions, recording architectural choices, or when the user mentions ADR, architecture decision, or asks to document why something was built a certain way.
---

# ADR Writer

Write and maintain Architecture Decision Records in `docs/ADR/`.

## When to Use

- Documenting a significant technical decision
- Recording why a particular approach was chosen over alternatives
- Creating a historical record of architectural choices

## File Naming

```
docs/ADR/YYYY-MM-DD-short-description.md
```

Example: `docs/ADR/2025-12-26-server-path-alias.md`

## Template

```markdown
# Decision: <Title>

**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded | Deprecated

## Context

Why was this decision needed? What problem are we solving?
Include code examples if relevant.

## Decision

What was decided? Be specific and include implementation details.

## Alternatives Considered

### 1. Alternative Name

Description of the alternative.

**Rejected:** Reason why this wasn't chosen.

### 2. Another Alternative

Description.

**Rejected:** Reason.

## Consequences

### Positive

- Benefit 1
- Benefit 2

### Negative

- Trade-off 1
- Trade-off 2

## Related Changes

- List any related code changes, config updates, or documentation
```

## After Writing

Update `docs/ADR/README.md` to add the new ADR to the decisions table:

```markdown
| Date       | Decision                                    | Summary                        |
| ---------- | ------------------------------------------- | ------------------------------ |
| YYYY-MM-DD | [Title](./YYYY-MM-DD-short-description.md)  | One-line summary of decision   |
```

## Guidelines

1. Focus on the **why**, not just the what
2. Document alternatives that were seriously considered
3. Be honest about trade-offs in consequences
4. Include code examples where they clarify the decision
5. Keep the summary in README.md concise (one line)
