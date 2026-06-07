import { knex as knexSetup } from "knex"
import { env } from './env'

var dbConnection: Object | String | null = null

switch (env.DATABASE_CLIENT) {
    case 'mysql2':
         dbConnection = {
            host: env.DATABASE_HOST,
            port: env.DATABASE_PORT,
            user: env.DATABASE_USER,
            password: env.DATABASE_PASSWORD,
            database: env.DATABASE_NAME,
         }
         break
    case 'pg':
        dbConnection = `postgresql://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}`
        break
    case 'sqlite':
        dbConnection = {
            filename: env.DATABASE_URL || './app.db',
        }
        break
    default:
        throw new Error('Unsupported database client')
}

export const config = {
    client: env.DATABASE_CLIENT,
    connection: dbConnection,
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: env.DATABASE_MIGRATIONS
    }
}

export const knex = knexSetup(config)