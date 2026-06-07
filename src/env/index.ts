import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
    // Service definitions
    SERVICE_PORT: z.coerce.number().default(3000),
    SERVICE_HOST: z.string().default('0.0.0.0'),

    // Database definitions
    DATABASE_CLIENT: z.enum(['mysql2', 'pg', 'sqlite']).default('sqlite'),
    DATABASE_MIGRATIONS: z.string().default('./db/migrations'),
    DATABASE_URL: z.string().default('./db/app.db'),
    DATABASE_HOST: z.string().default('127.0.0.1'),
    DATABASE_PORT: z.coerce.number().default(3306),
    DATABASE_USER: z.string().default('root'),
    DATABASE_PASSWORD: z.string().default(''),
    DATABASE_NAME: z.string().default('daily_diet_api'),
    DATABASE_SSL: z.coerce.boolean().default(false),

    // Password definitions
    PASSWORD_MIN_LENGTH: z.coerce.number().default(0), // 0 means no minimum length
    PASSWORD_MAX_LENGTH: z.coerce.number().default(0), // 0 means no maximum length
    PASSWORD_MIN_CAPITAL: z.coerce.number().default(0), // 0 means no minimum capital letters
    PASSWORD_MIN_LOWERCASE: z.coerce.number().default(0), // 0 means no minimum lowercase letters
    PASSWORD_MIN_NUMBERS: z.coerce.number().default(0), // 0 means no minimum numbers
    PASSWORD_MIN_SYMBOLS: z.coerce.number().default(0), // 0 means no minimum symbols

    // Login definitions
    MAX_FAILED_LOGIN_ATTEMPTS: z.coerce.number().default(0), // 0 means no limit
    BLOCK_DURATION_MINUTES: z.coerce.number().default(0), // 0 means no block duration
    
    // Session definitions
    SESSION_MAX_INACTIVE_DAYS: z.coerce.number().default(1), // 1 means 1 day
    SESSION_MAX_SIMULTANEOUS_SESSIONS: z.coerce.number().default(0), // 0 means no limit
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
    console.error('Invalid environment variables', _env.error.format())
    throw new Error('Invalid environment error')
}

export const env = _env.data