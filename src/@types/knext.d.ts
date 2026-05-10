import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: number,
            key: string,
            password: string,
            name: string,
            avatar: string | null,
            failedLoginAttempts: number,
            blocked: boolean,
            blockedTill: string | null,
            inactivated: boolean,
            createdAt: string,
            updatedAt: string
        },

        sessions: {
            id: number,
            key: string,
            userId: number,
            isFinished: boolean,
            createdAt: string,
            updatedAt: string
        }
    }
}