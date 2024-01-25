import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

// with zod, we pass the type of environment variable
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

// testing the validation of envSchema
const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Inavalid environment variables!', _env.error.format)

  throw new Error('Invalid environment variable!')
}

// if throw sucess create and export env variable
export const env = _env.data
