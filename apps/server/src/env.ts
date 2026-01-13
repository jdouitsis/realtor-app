import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { cleanEnv, port, str, url } from 'envalid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })

// eslint-disable-next-line no-restricted-syntax
export const env = cleanEnv(process.env, {
  PORT: port({ devDefault: 3100 }),
  WEB_URL: str({ devDefault: 'http://localhost:5177' }),
  COOKIE_DOMAIN: str({ devDefault: '', default: '' }),
  DATABASE_URL: url({ devDefault: 'postgresql://postgres:postgres@localhost:5444/postgres' }),
  RESEND_API_KEY: str({ devDefault: '' }),
  FROM_EMAIL: str({ devDefault: 'noreply@localhost' }),
  LOG_LEVEL: str({
    devDefault: 'debug',
    default: 'info',
    choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
  }),
})
