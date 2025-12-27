import { afterAll, afterEach, beforeEach } from 'vitest'

import { beginTestTransaction, closeTestDb, rollbackTestTransaction } from './db'

beforeEach(async () => {
  await beginTestTransaction()
})

afterEach(async () => {
  await rollbackTestTransaction()
})

afterAll(async () => {
  await closeTestDb()
})
