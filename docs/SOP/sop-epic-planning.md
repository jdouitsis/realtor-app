# SOP: Epic Planning

This SOP defines the standard structure and requirements for planning epics in this codebase.

## When to Use

- Planning a new large feature that spans multiple components
- Breaking down complex work into iterative, trackable features
- Creating technical specifications for implementation

## Epic Document Structure

Every epic must include the following sections:

### Required Sections

1. **Overview** - What the epic accomplishes and why
2. **Goals** - Checkboxes for measurable outcomes
3. **Non-Goals** - Explicit scope boundaries
4. **Technical Context** - Tech stack, architectural decisions, database design
5. **Feature Tracker** - Table of features with status and file links
6. **Feature Dependencies** - Visual diagram showing relationships (see below)
7. **Instructions for Engineers** - How to work with the epic
8. **Open Questions** - Unresolved decisions with owners and status
9. **Revision History** - Track changes to the epic

### Feature Dependency Diagram

**Every epic MUST include an ASCII dependency diagram** showing how features relate to each other. This helps engineers understand:

- Which features can be worked on in parallel
- Which features block others
- The recommended implementation order

Example format:

```
                            ┌─────────────────────┐
                            │  01. Foundation     │
                            │      Feature        │
                            └─────────┬───────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  02. Feature A      │   │  03. Feature B      │   │  04. Feature C      │
│      (parallel)     │   │      (parallel)     │   │      (parallel)     │
└─────────┬───────────┘   └─────────┬───────────┘   └─────────────────────┘
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
           ┌─────────────────────┐
           │  05. Dependent      │
           │      Feature        │
           └─────────────────────┘
```

After the diagram, include:

1. **Recommended Implementation Order** - Linear sequence (e.g., `01 → 02 → 03 → 04 → 05`)
2. **Parallelization Notes** - Which features can be built simultaneously

## Feature Document Structure

Each feature file must include:

1. **Summary** - Brief description
2. **Prerequisites** - Which features must be complete first
3. **User Stories** - Who benefits and how
4. **Acceptance Criteria** - Checkboxes for completion
5. **Technical Specification** - Data model, API, UI, business logic
6. **Edge Cases & Error Handling** - Table of scenarios
7. **Testing Requirements** - Checkboxes for test coverage
8. **Implementation Notes** - Tips, gotchas, patterns to follow
9. **Files to Create/Modify** - Table with file paths and actions
10. **Out of Scope** - What this feature does NOT include

## File Organization

```
docs/epics/
├── epic-{name}.md                    # Main epic document
├── feature-01-{name}.md              # First feature spec
├── feature-02-{name}.md              # Second feature spec
└── ...
```

## Status Values

| Status      | Meaning                                  |
| ----------- | ---------------------------------------- |
| Pending     | Not yet started                          |
| In Progress | Currently being implemented              |
| In Review   | Implementation complete, awaiting review |
| Complete    | Merged and deployed                      |
| Blocked     | Cannot proceed (see notes in feature)    |

## Checklist Before Finalizing Epic

- [ ] All features have clear acceptance criteria
- [ ] Feature dependency diagram is included
- [ ] Recommended implementation order is documented
- [ ] Parallel work opportunities are identified
- [ ] Database schema changes are documented
- [ ] API endpoints are specified
- [ ] UI components are mapped out
- [ ] Testing requirements are defined
- [ ] Open questions are tracked with owners
