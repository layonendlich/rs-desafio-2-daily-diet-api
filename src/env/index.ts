import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
    SERVICE_PORT: z.coerce.number().default(3000),
    SERVICE_HOST: z.string().default('0.0.0.0'),

    DATABASE_CLIENT: z.enum(['mysql', 'pg', 'sqlite']).default('sqlite'),
    DATABASE_URL: z.string().default('./db/app.db'),
    DATABASE_MIGRATIONS: z.string().default('./db/migrations')
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
    console.error('Invalid environment variables', _env.error.format())
    throw new Error('Invalid environment error')
}

export const env = _env.data