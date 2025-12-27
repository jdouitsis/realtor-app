import { createExpressMiddleware } from '@trpc/server/adapters/express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import { env } from './env'
import { logger } from './lib/logger'
import { appRouter } from './routers'
import { createContext } from './trpc'

const app = express()

app.use(cors({ origin: env.WEB_URL, credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, ctx, path, type }) {
      // Use context logger if available, fall back to root logger
      const log = ctx?.log ?? logger
      log.error(
        {
          path,
          type,
          code: error.code,
          stack: env.isDev ? error.stack : undefined,
        },
        error.message
      )
    },
  })
)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.isDev ? 'development' : 'production' }, 'Server started')
})
