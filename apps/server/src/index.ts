import cors from 'cors'
import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routers'
import { createContext } from './trpc'
import { env } from './env'

const app = express()

app.use(cors({ origin: env.WEB_URL, credentials: true }))
app.use(express.json())

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
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
