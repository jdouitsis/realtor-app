import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks',
    // Run tests sequentially for database transaction isolation
    forks: {
      singleFork: true,
    },
  },
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, './src'),
    },
  },
})
