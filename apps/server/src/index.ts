import { createApp } from './app'
import { env } from './env'
import { logger } from './lib/logger'

const app = createApp()

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.isDev ? 'development' : 'production' }, 'Server started')
})
