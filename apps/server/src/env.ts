import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { cleanEnv, port, str } from 'envalid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')

dotenv.config({ path: path.join(rootDir, '.env') })

// eslint-disable-next-line no-restricted-syntax
export const env = cleanEnv(process.env, {
  PORT: port({ default: 3001 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  WEB_URL: str({ default: 'http://localhost:5173' }),
})
