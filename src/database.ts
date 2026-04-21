import { knex as knexSetup } from "knex"
import { env } from './env'

var dbConnection: Object | String | null = null

switch (env.DATABASE_CLIENT) {
    case 'mysql':
         dbConnection = {
            host: '127.0.0.1',
            port: 3306,
            user: 'your_database_user',
            password: 'your_database_password',
            database: 'myapp_test',
         }
         break
    case 'pg':
        dbConnection = env.DATABASE_URL
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