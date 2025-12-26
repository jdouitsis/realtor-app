import { createExpressMiddleware } from '@trpc/server/adapters/express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import { env } from './env'
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
    onError({ error, ctx, path, input, type }) {
      console.error(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            requestId: ctx?.requestId,
            path,
            type,
            code: error.code,
            message: error.message,
            // Only include sensitive data in development
            input: env.isDev ? input : undefined,
            stack: env.isDev ? error.stack : undefined,
          },
          null,
          env.isDev ? 2 : 0
        )
      )
    },
  })
)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.listen(env.PORT, () => {
  if (env.isDev) {
    console.log(`Server running on http://localhost:${env.PORT}`)
  } else {
    console.log(`Server running on port ${env.PORT}`)
  }
})
