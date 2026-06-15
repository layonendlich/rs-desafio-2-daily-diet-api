import argon2 from "argon2"
import { knex } from "../database"
import { z } from 'zod'
import { env } from "../env"

export interface UserInterface {
    id: number | null,
    key: string,
    // password: string,
    name: string,
    avatar: string | null,
    failedLoginAttempts: number,
    blocked: boolean,
    blockedTill: string | null,
    inactivated: boolean,
    createdAt: string,
    updatedAt: string
}

export class User implements UserInterface {
    public  id: number | null
    public  key: string
    #password: string
    public  name: string
    public  avatar: string | null
    public  failedLoginAttempts: number
    public  blocked: boolean
    public  blockedTill: string | null
    public  inactivated: boolean
    public  createdAt: string
    public  updatedAt: string
    #errors: Array<{ errorMessage: string, ofensorElement: string | null }>
    [key: string]: any



    constructor () {
        this.id = null
        this.key = ''
        this.#password = ''
        this.name = ''
        this.avatar = ''
        this.failedLoginAttempts = 0
        this.blocked = false
        this.blockedTill = null
        this.inactivated = false
        this.createdAt = ''
        this.updatedAt = ''
        this.#errors = []
    }



    schema () {
        return z.object({
            id: z.number().nullable().default(null),
            key: z.string().default(''),
            password: z.string().default(''),
            name: z.string().default(''),
            avatar: z.string().nullable().default(null),
            failedLoginAttempts: z.number().default(0),
            blocked: z.boolean().default(false),
            blockedTill: z.string().nullable().default(null),
            inactivated: z.boolean().default(false),
            createdAt: z.string().nullable().default(null),
            updatedAt: z.string().nullable().default(null)
        })
    }



    async getById (id: number) {
        try {
            const res = await knex('users').where({ id }).first()
            if (res) {
                this.id = res.id
                this.key = res.key
                this.#password = res.password
                this.name = res.name
                this.avatar = res.avatar
                this.failedLoginAttempts = res.failedLoginAttempts
                this.blocked = res.blocked
                this.blockedTill = res.blockedTill
                this.inactivated = res.inactivated
                this.createdAt = res.createdAt
                this.updatedAt = res.updatedAt
                return this
            }
            return false
        } catch (error) {
            console.log(new Date().toISOString(), `Error fetching user by id:\n`, error)
            throw ({
                errorMessage: 'Error fetching user by id',
                ofensorElement: null,
            })
        }
    }



    async getByKey (key: string) {
        try {
            const res = await knex('users').where({ key }).first()
            console.log(res)
            if (res) {
                this.id = res.id
                this.key = res.key
                this.#password = res.password
                this.name = res.name
                this.avatar = res.avatar
                this.failedLoginAttempts = res.failedLoginAttempts
                this.blocked = res.blocked
                this.blockedTill = res.blockedTill
                this.inactivated = res.inactivated
                this.createdAt = res.createdAt
                this.updatedAt = res.updatedAt
                return this
            }
            return false
        } catch (error) {
            console.log(new Date().toISOString(), `Error fetching user by key:\n`, error)
            throw ({
                errorMessage: 'Error fetching user by key',
                ofensorElement: null,
            })
        }
    }



    getPassword () {
        return this.#password
    }



    getErrors () {
        return this.#errors
    }



    async save () {
        const currentDate = new Date().toISOString().replace('T', ' ').slice(0, 19)
        
        if (!await this.validate()) {
            return false
        }

        try {
            if (this.id) {
                this.updatedAt = currentDate

                await knex('users').where({ id: this.id }).update({
                    key: this.key,
                    password: this.#password,
                    name: this.name,
                    avatar: this.avatar,
                    failedLoginAttempts: this.failedLoginAttempts,
                    blocked: this.blocked,
                    blockedTill: this.blockedTill,
                    inactivated: this.inactivated,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt
                })
            } else {
                this.createdAt = currentDate
                this.updatedAt = currentDate
                
                const res = await knex('users').insert({
                    key: this.key,
                    password: this.#password,
                    name: this.name,
                    avatar: this.avatar,
                    failedLoginAttempts: this.failedLoginAttempts,
                    blocked: this.blocked,
                    blockedTill: this.blockedTill,
                    inactivated: this.inactivated,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt
                }).returning('id')
                this.id = res[0]

            }
            return this
            
        } catch (error) {
            console.log(new Date().toISOString(), `Error saving user:\n`, error)

            this.#errors.push({
                errorMessage: 'Error saving user',
                ofensorElement: null,
            })

            return false
        }
    }



    async delete () {
        if (!this.id) {
            throw ({
                errorMessage: 'User not found',
                ofensorElement: 'id',
            })
        }

        try {
            await knex('users').where({ id: this.id }).del()
            return true
        } catch (error) {
            console.log(new Date().toISOString(), 'Failed to delete user:\n', error)
            throw ({
                errorMessage: 'Failed to delete user',
                ofensorElement: null,
            })
        }

    }



    async setPassword (password: string) {
        if (password.length < env.PASSWORD_MIN_LENGTH) {
            throw ({
                errorMessage: 'Password is too short',
                ofensorElement: 'password',
            })
        }

        if (env.PASSWORD_MAX_LENGTH > 0 && password.length > env.PASSWORD_MAX_LENGTH) {
            throw ({
                errorMessage: 'Password is too long',
                ofensorElement: 'password',
            })
        }

        if (env.PASSWORD_MIN_CAPITAL > 0 && (password.match(/[A-Z]/g)?.length || 0) < env.PASSWORD_MIN_CAPITAL) {
            throw ({
                errorMessage: 'Combine numbers, letters and symbols to create a stronger password',
                ofensorElement: 'password',
            })
        }

        if (env.PASSWORD_MIN_LOWERCASE > 0 && (password.match(/[a-z]/g)?.length || 0) < env.PASSWORD_MIN_LOWERCASE) {
            throw ({
                errorMessage: 'Combine numbers, letters and symbols to create a stronger password',
                ofensorElement: 'password',
            })
        }

        if (env.PASSWORD_MIN_NUMBERS > 0 && (password.match(/[0-9]/g)?.length || 0) < env.PASSWORD_MIN_NUMBERS) {
            throw ({
                errorMessage: 'Combine numbers, letters and symbols to create a stronger password',
                ofensorElement: 'password',
            })
        }

        if (env.PASSWORD_MIN_SYMBOLS > 0 && password.length - password.replace(/[^A-Za-z0-9]/g, '').length < env.PASSWORD_MIN_SYMBOLS) {
            throw ({
                errorMessage: 'Combine numbers, letters and symbols to create a stronger password',
                ofensorElement: 'password',
            })
        }
        
        let invalidChars = ''
        for (let x = 0; x < password.length; x++) {
            if (password.charCodeAt(x) < 32 || password.charCodeAt(x) > 255) {
                invalidChars+= password.charAt(x)
            }
        }

        if (invalidChars.length) {
            throw ({
                errorMessage: 'Invalid chars in password: ' + invalidChars,
                ofensorElement: 'password',
            })
        }

        this.#password = await argon2.hash(password)
        return this.#password
    }



    async verifyPassword (password: string) {
        return await argon2.verify(this.#password, password)
    }



    async validate () {
        this.#errors = []
        
        // for (const field of ['key', 'password', 'name']) {
        for (const field of ['key', 'name']) {
            if (!this[field] || !this[field].length) {
                this.#errors.push({
                    errorMessage: `${field} is required`,
                    ofensorElement: field,
                })
            }
        }

        if (!this.#password || !this.#password.length) {
            this.#errors.push({
                errorMessage: `password is required`,
                ofensorElement: 'password',
            })
        }

        await knex('users').where({ key: this.key }).whereNot({ id: this.id || 0 }).first().then((res) => {
            if (res) {
                this.#errors.push({
                    errorMessage: `key "${this.key}" already exists`,
                    ofensorElement: 'key',
                })
            }
        })

        if (!this.#errors.length) return true

        return false
    }
}