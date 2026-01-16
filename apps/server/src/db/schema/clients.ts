import { CLIENT_STATUSES } from '@app/shared/clients'
import { index, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Enums
export const clientStatusEnum = pgEnum('client_status', CLIENT_STATUSES)

// Junction table for realtor-client relationships
// Note: Unique constraint on (realtor_id, client_id) WHERE deleted_at IS NULL
// is managed via partial index in migration 0007, not in Drizzle schema
export const realtorClients = pgTable(
  'realtor_clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    realtorId: uuid('realtor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: clientStatusEnum('status').notNull().default('invited'),
    nickname: varchar('nickname', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('realtor_clients_realtor_id_idx').on(table.realtorId)]
)

export type RealtorClient = typeof realtorClients.$inferSelect
export type NewRealtorClient = typeof realtorClients.$inferInsert
