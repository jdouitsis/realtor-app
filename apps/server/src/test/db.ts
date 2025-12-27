import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { createApp } from '../app'
import type { Database } from '../db'
import * as schema from '../db/schema'
import { env } from '../env'

const databaseUrl = env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set for tests')
}

// Use max: 1 to allow manual BEGIN/ROLLBACK transaction control
const testClient = postgres(databaseUrl, { max: 1 })
export const testDb = drizzle(testClient, { schema })

// Store the current transaction for the test
let currentTx: Database | null = null

/**
 * Returns the current test transaction.
 * Must be called within a test that has begun a transaction.
 */
export function getCurrentTx() {
  if (!currentTx) throw new Error('No active test transaction')
  return currentTx
}

/**
 * Creates an Express app with the current test transaction injected.
 * Use this instead of manually calling createApp(getCurrentTx()).
 *
 * @example
 * const app = createTestApp()
 * const res = await request(app).get('/health')
 */
export function createTestApp() {
  return createApp(getCurrentTx())
}

/**
 * Truncates all tables in the public schema.
 * Dynamically queries for table names so new tables are automatically included.
 */
async function truncateAllTables() {
  const tables = await testDb.execute<{ tablename: string }>(sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `)

  if (tables.length === 0) return

  const tableNames = tables.map((t) => t.tablename).join(', ')
  await testDb.execute(sql.raw(`TRUNCATE ${tableNames} CASCADE`))
}

/**
 * Begins a test transaction and truncates all tables.
 * Call in beforeEach() for test isolation.
 */
export async function beginTestTransaction() {
  await testDb.execute(sql`BEGIN`)
  await truncateAllTables()
  currentTx = testDb
}

/**
 * Rolls back the test transaction.
 * Call in afterEach() to undo all changes from the test.
 */
export async function rollbackTestTransaction() {
  await testDb.execute(sql`ROLLBACK`)
  currentTx = null
}

/**
 * Closes the test database connection.
 * Call in afterAll() or globalTeardown.
 */
export async function closeTestDb() {
  await testClient.end()
}
