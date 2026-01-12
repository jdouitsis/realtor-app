# SOP: Database Migrations

This document explains how to manage database schema changes using Drizzle ORM.

## Architecture

```
Schema Change
    ↓
db:generate (creates SQL migration file)
    ↓
Commit migration file to git
    ↓
db:migrate (applies to database)
    ↓
Railway auto-runs on deploy
```

## Key Files

| File                              | Purpose                                      |
| --------------------------------- | -------------------------------------------- |
| `apps/server/src/db/schema/`      | Schema definitions (tables, columns, etc.)   |
| `apps/server/drizzle/`            | Generated SQL migration files                |
| `apps/server/drizzle.config.ts`   | Drizzle Kit configuration                    |
| `apps/server/nixpacks.toml`       | Railway deploy config (runs migrations)      |

## Commands

Run from repository root:

| Command                                       | Purpose                                      |
| --------------------------------------------- | -------------------------------------------- |
| `pnpm --filter @app/server db:generate`   | Generate migration from schema changes       |
| `pnpm --filter @app/server db:migrate`    | Apply pending migrations to database         |
| `pnpm --filter @app/server db:push`       | Push schema directly (dev only, no history)  |
| `pnpm --filter @app/server db:studio`     | Open Drizzle Studio GUI                      |

## Development Workflow

### Option A: Using Migrations (Recommended)

1. Edit schema in `apps/server/src/db/schema/`
2. Generate migration:
   ```bash
   pnpm --filter @app/server db:generate
   ```
3. Review generated SQL in `apps/server/drizzle/`
4. Apply migration:
   ```bash
   pnpm --filter @app/server db:migrate
   ```

### Option B: Quick Iteration with db:push

For rapid prototyping, use `db:push` to sync schema directly:

```bash
pnpm --filter @app/server db:push
```

**Warning:** `db:push` does not create migration files. Before merging to main, always run `db:generate` to create proper migrations.

## Production Workflow (Railway)

Migrations run automatically at startup (not during build) via `nixpacks.toml`:

```toml
[start]
cmd = "pnpm --filter @app/server db:migrate && pnpm --filter @app/server start"
```

**Why at startup instead of build?** Railway's internal networking (`postgres.railway.internal`) is only available at runtime, not during the build phase.

### Deployment Checklist

1. Make schema changes locally
2. Run `db:generate` to create migration file
3. Test migration locally with `db:migrate`
4. Commit migration file to git
5. Push to main - Railway runs migration automatically

### Manual Migration (Alternative)

To run migrations manually against Railway:

```bash
# Get DATABASE_URL from Railway dashboard → PostgreSQL → Connect tab
export DATABASE_URL="postgresql://..."

pnpm --filter @app/server db:migrate
```

## Adding a New Table

1. Create schema file in `apps/server/src/db/schema/`:

   ```typescript
   // apps/server/src/db/schema/posts.ts
   import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

   export const posts = pgTable('posts', {
     id: uuid('id').primaryKey().defaultRandom(),
     title: text('title').notNull(),
     content: text('content').notNull(),
     createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
   })
   ```

2. Export from schema index:

   ```typescript
   // apps/server/src/db/schema/index.ts
   export * from './posts'
   ```

3. Generate and apply migration:

   ```bash
   pnpm --filter @app/server db:generate
   pnpm --filter @app/server db:migrate
   ```

## Modifying Existing Tables

### Adding a Column

```typescript
// Before
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
})

// After
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),  // New column (nullable)
})
```

Then generate migration: `pnpm --filter @app/server db:generate`

### Renaming a Column

Drizzle detects renames as drop + create. For safe renames:

1. Add new column (nullable)
2. Deploy and backfill data
3. Remove old column

Or use raw SQL in migration file for `ALTER TABLE ... RENAME COLUMN`.

### Dropping a Column

Remove the column from schema and generate migration. **Warning:** This is destructive and irreversible.

## Troubleshooting

### "No changes detected"

**Cause:** Schema file not exported from index.

**Fix:** Ensure your schema is exported in `apps/server/src/db/schema/index.ts`.

### "Migration failed on Railway"

**Cause:** Migration incompatible with existing data.

**Fix:**
1. Check Railway logs for specific error
2. If data constraint issue, create a data migration first
3. For nullable columns, add `.default()` or make nullable

### "db:push deleted my data"

**Cause:** `db:push` can drop columns/tables to match schema.

**Fix:** Always use `db:generate` + `db:migrate` when you have data you want to keep.

### "Migration already applied"

**Cause:** Running migration that's in `drizzle/__drizzle_migrations` table.

**Fix:** Drizzle tracks applied migrations automatically. This is expected behavior - the migration won't run twice.

## Best Practices

1. **Never edit migration files after they're applied** - Create a new migration instead
2. **Always commit migration files** - They should be in version control
3. **Test migrations locally first** - Before pushing to production
4. **Use nullable for new columns** - Or provide a default value
5. **Avoid db:push in production** - No rollback capability, no history
6. **Review generated SQL** - Ensure it does what you expect
