import { z } from 'zod'
import { knex } from "../database"
import crypto from 'node:crypto'
import { env } from '../env'

export interface SessionInterface {
    id: number | null,
    key: string,
    userId: number,
    isFinished: boolean,
    createdAt: string,
    updatedAt: string
}

export class Session implements SessionInterface {
    public id: number | null
    public key: string
    public userId: number
    public isFinished: boolean
    public createdAt: string
    public updatedAt: string
    #errors: Array<{ errorMessage: string, ofensorElement: string | null }>

    constructor () {
        this.id = null
        this.key = ''
        this.userId = 0
        this.isFinished = false
        this.createdAt = ''
        this.updatedAt = ''
        this.#errors = []
    }


    schema () {
        return z.object({
            id: z.number().default(0),
            key: z.string().default(''),
            userId: z.number().default(0),
            isFinished: z.boolean().default(false),
            createdAt: z.string().nullable().default(null),
            updatedAt: z.string().nullable().default(null)
        })
    }


    async getById (id: number) {
        try {
            const res = await knex('sessions').where({ id }).first()
            if (res) {
                this.id = res.id
                this.key = res.key
                this.userId = res.userId
                this.isFinished = res.isFinished
                this.createdAt = res.createdAt
                this.updatedAt = res.updatedAt
                return this
            }
            return false
        } catch (error) {
            console.log(new Date().toISOString(), `Error fetching session by id:\n`, error)
            
            throw ({
                errorMessage: 'Error fetching session by id',
                ofensorElement: null,
            })
        }
    }


    async getByKey (key: string) {
        try {
            const res = await knex('sessions').where({ key }).first()
            if (res) {
                this.id = res.id
                this.key = res.key
                this.userId = res.userId
                this.isFinished = res.isFinished
                this.createdAt = res.createdAt
                this.updatedAt = res.updatedAt
                return this
            }
            return false
        } catch (error) {
            console.log(new Date().toISOString(), `Error fetching session by key:\n`, error)
            
            throw ({
                errorMessage: 'Error fetching session by key',
                ofensorElement: null,
            })
        }
    }


    getErrors () {
        return this.#errors
    }


    async save () {
        const currentDate = new Date().toISOString().replace('T', ' ').slice(0, 19)

        if (!this.userId) {
            this.#errors.push({
                errorMessage: 'Session must be associated with a user',
                ofensorElement: 'userId'
            })
            return false
        }

        try {
            if (this.id) {
                this.updatedAt = currentDate
    
                const res = await knex('sessions').where({ id: this.id }).update({
                    key: this.key,
                    userId: this.userId,
                    isFinished: this.isFinished,
                    updatedAt: this.updatedAt
                })
                return this

            } else {
                if (env.SESSION_MAX_SIMULTANEOUS_SESSIONS > 0) {
                    const activeSessions = await knex('sessions')
                        .where({ userId: this.userId, isFinished: false })
                        .orderBy('updatedAt', 'desc')
    
                    if (activeSessions && activeSessions.length >= env.SESSION_MAX_SIMULTANEOUS_SESSIONS) {
                        for (let i = env.SESSION_MAX_SIMULTANEOUS_SESSIONS - 1; i < activeSessions.length; i++) {
                            await knex('sessions').where({ id: activeSessions[i].id }).update({
                                isFinished: true,
                                updatedAt: currentDate
                            })
                        }
                    }
                }
    
                this.key = crypto.randomUUID()
                this.createdAt = currentDate
                this.updatedAt = currentDate
                
                const res = await knex('sessions').insert({
                    key: this.key,
                    userId: this.userId,
                    isFinished: this.isFinished,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt
                }).returning('id')
                if (res) {
                    this.id = res[0]
                    return this
                }

                return false
            }

        } catch (error) {
            console.log(new Date().toISOString(), `Error saving session:\n`, error)

            this.#errors.push({
                errorMessage: 'Error saving session',
                ofensorElement: null,
            })
            
            return false
        }
    }


    async delete () {
        if (!this.id) {
            this.#errors.push({
                errorMessage: 'Cannot delete session without id',
                ofensorElement: 'id'
            })
            return false
        }

        try {
            const res = await knex('sessions').where({ id: this.id }).del()
            if (res) {
                return true
            }
            return false
        } catch (error) {
            console.log(new Date().toISOString(), `Error deleting session by id:\n`, error)

            throw ({
                errorMessage: 'Error deleting session by id',
                ofensorElement: null,
            })
        }
    }
}