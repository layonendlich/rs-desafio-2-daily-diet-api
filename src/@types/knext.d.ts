import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: number,
            usename: string,
            password: string,
            name: string,
            avatar: string,
            createdAt: date,
            updatedAt: date
        }
    }
}