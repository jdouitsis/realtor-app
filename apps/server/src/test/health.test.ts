import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createTestApp } from './db'

describe('GET /health', () => {
  it('returns status ok', async () => {
    const app = createTestApp()

    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
})
