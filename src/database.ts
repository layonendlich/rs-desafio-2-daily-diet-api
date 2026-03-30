import { knex as knexSetup } from "knex"
import { env } from './env'

export const config = {
    client: env.DATABASE_CLIENT,
    connection: env.DATABASE_URL,
    useNullAsDefaul: true,
    migrations: {
        extension: 'ts',
        directory: env.DATABASE_MIGRATIONS
    }
}

export const knex = knexSetup(config)