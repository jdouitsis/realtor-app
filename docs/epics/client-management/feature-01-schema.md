# Feature 01: Schema Migration

> **Epic:** [Client Management](overview.md)
> **Status:** Complete
> **Estimated Effort:** S

## Summary

Update the `client_status` enum to rename `pending` → `invited` and add the `inactive` status value. This migration enables the full client lifecycle: invited → active → inactive (with re-activation back to active).

## Prerequisites

- [ ] None - this is the foundation feature

## User Stories

- As a realtor, I want clients to have meaningful status labels so that I understand their relationship state at a glance

## Acceptance Criteria

- [ ] AC1: The `client_status` enum has exactly three values: `invited`, `active`, `inactive`
- [ ] AC2: Existing `pending` records are migrated to `invited`
- [ ] AC3: The Drizzle schema reflects the updated enum values
- [ ] AC4: TypeScript types are updated and exported
- [ ] AC5: Migration runs successfully on a fresh database
- [ ] AC6: Migration runs successfully on a database with existing `pending` status records

## Technical Specification

### Data Model Changes

Update `apps/server/src/db/schema/clients.ts`:

```typescript
// Before
export const clientStatusEnum = pgEnum('client_status', ['pending', 'active'])

// After
export const clientStatusEnum = pgEnum('client_status', ['invited', 'active', 'inactive'])
```

### Migration Strategy

PostgreSQL enum modifications require careful handling. The migration should:

1. Add the `inactive` value (safe - just adds)
2. Rename `pending` to `invited` (requires updating existing rows first)

**Option A: Drizzle handles it** - Generate migration with `db:generate` and verify the SQL

**Option B: Manual migration if Drizzle struggles with rename** - Write custom SQL:

```sql
-- Step 1: Add new value
ALTER TYPE client_status ADD VALUE IF NOT EXISTS 'inactive';

-- Step 2: For renaming, we need to:
-- 2a. Add 'invited' as a new value
ALTER TYPE client_status ADD VALUE IF NOT EXISTS 'invited';

-- 2b. Update existing rows from 'pending' to 'invited'
UPDATE realtor_clients SET status = 'invited' WHERE status = 'pending';

-- 2c. Note: PostgreSQL doesn't support removing enum values easily
-- The 'pending' value will remain in the enum but be unused
-- This is acceptable for this migration
```

### API Changes

None - schema only.

### UI Components

None - schema only.

### Business Logic

None - schema only.

## Edge Cases & Error Handling

| Scenario                                      | Expected Behavior                                       |
| --------------------------------------------- | ------------------------------------------------------- |
| Migration runs on empty database              | Enum created with new values, no data migration needed  |
| Migration runs with existing `pending` rows   | Rows updated to `invited`, no data loss                 |
| Migration runs twice                          | Idempotent - no errors on re-run                        |
| Rollback needed                               | Reverse migration updates `invited` back to `pending`   |

## Testing Requirements

- [ ] Run migration on fresh database - verify enum values
- [ ] Run migration on database with test data containing `pending` status
- [ ] Verify application still works after migration
- [ ] Run `pnpm typecheck` - no type errors

## Implementation Notes

1. **Generate migration first**: Run `pnpm --filter @app/server db:generate` after updating the schema file
2. **Review generated SQL**: Check the migration file in `apps/server/drizzle/` to ensure it handles the rename correctly
3. **Test locally**: Run `pnpm --filter @app/server db:migrate` against your local database
4. **Check for issues**: If Drizzle generates problematic SQL for the enum rename, you may need to manually adjust the migration file

### Drizzle Enum Gotcha

Drizzle may not handle enum value renames gracefully. If the generated migration drops and recreates the enum (which would fail with existing data), manually edit the migration to use `ALTER TYPE ... ADD VALUE` and `UPDATE` statements instead.

## Files to Create/Modify

| File                                            | Action                                    |
| ----------------------------------------------- | ----------------------------------------- |
| `apps/server/src/db/schema/clients.ts`          | Update enum values                        |
| `apps/server/drizzle/XXXX_*.sql`                | Generated migration file (review it)      |

## Out of Scope

- Adding new columns to `realtorClients`
- Creating new tables
- Any backend procedures
