import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from 'zod'
import argon2 from "argon2";

const userBodySchema = z.object({
    username: z.string().default(''),
    password: z.string().default(''),
    name: z.string().default(''),
    avatar: z.string().nullable().default(null),
    createdAt: z.string().nullable().default(null),
    updatedAt: z.string().nullable().default(null)
})

async function encryptPassword (password: string) {
    return await argon2.hash(password)
}

export async function users (app: FastifyInstance) {

    /** CRETE */
    app.post('/', async (request, reply) => {

        const { username, password, name, avatar } = userBodySchema.parse(
            typeof request.body === 'string' ? JSON.parse(request.body) : request.body
        )

        const user = {
            username,
            password,
            name,
            avatar
        }

        for (const field of ['username', 'password', 'name']) {
            if (!user[field].length) {
                return reply
                    .status(400)
                    .send({
                        errorMessage: `${field} is required`,
                        ofensorElelement: field,
                    })
            }
        }

        user.password = await encryptPassword(user.password)

        let res = await knex('users').where({ username })

        if (res.length) {
            return reply
                .status(409)
                .send({
                    errorMessage: `User '${username}' already exists`,
                    ofensorElelement: 'username',
                })
        }

        res = await knex('users').insert(user).returning('*')

        return reply.status(201).send({ user: res[0] })
    })



    /** READ BY ID */
    app.get('/:username', async (request, reply) => {
        const { username } = request.params as { username: string }

        const user = await knex('users').where({ username }).first()

        if (!user) {
            return reply
                .status(404)
                .send({
                    errorMessage: `User '${username}' not found`,
                    ofensorElelement: 'username',
                })
        }

        delete user.password

        return reply.send({ user })
    })



    /** READ */
    app.get('/', async (request, reply) => {
        const res = await knex('users').select()

        for (const user of res) {
            delete user.password
        }

        return reply.send({ users: res })
    })



    /** UPDATE */
    app.patch('/:username', async (request, reply) => {
        const { username } = request.params as { username: string }

        const user = await knex('users').where({ username }).first()

        if (!user) {
            return reply
                .status(404)
                .send({
                    errorMessage: `User '${username}' not found`,
                    ofensorElelement: 'username',
                })
        }

        const data = userBodySchema.partial().parse(
            typeof request.body === 'string' ? JSON.parse(request.body) : request.body
        )

        if (data.username && user.username !== data.username) {
            let res = await knex('users').where({ username: data.username }).first()
            if (res) {
                return reply
                    .status(409)
                    .send({
                        errorMessage: `User '${data.username}' already exists`,
                        ofensorElelement: 'username',
                    })
            }
        }

        let modifications = 0
        for (const field of ['username', 'name']) {
            if (data[field] && data[field].length && user[field] !== data[field]) {
                user[field] = data[field]
                modifications++
            }
        }

        if (!modifications) {
            console.log('No modifications')
            return reply.send({ user })
        }

        user.updatedAt = new Date().toISOString()

        let res = await knex('users').where({ id: user.id }).update(user).returning('*')

        return reply.send({ user: res[0] })
    })



    /** DELETE */
    app.delete('/:username', async (request, reply) => {
        const { username } = request.params as { username: string }

        const user = await knex('users').where({ username }).first()

        if (!user) {
            return reply
                .status(404)
                .send({
                    errorMessage: `User '${username}' not found`,
                    ofensorElelement: 'username',
                })
        }

        await knex('users').where({ id: user.id }).del()

        return reply.status(204).send()
    })



    /** PASSWORD CHANGE */
    app.post('/:username/password', async (request, reply) => {
        const { username } = request.params as { username: string }
        const {currentPassword, newPassword} = z.object({
            currentPassword: z.string().default(''),
            newPassword: z.string().default('')
        }).parse(
            typeof request.body === 'string' ? JSON.parse(request.body) : request.body
        )

        if (!currentPassword.length) {
            return reply
                .status(400)
                .send({
                    errorMessage: 'Current password is required',
                    ofensorElelement: 'currentPassword',
                })
        }

        if (!newPassword.length) {
            return reply
                .status(400)
                .send({
                    errorMessage: 'New password is required',
                    ofensorElelement: 'newPassword',
                })
        }

        const user = await knex('users').where({ username }).first()

        if (!user) {
            return reply
                .status(404)
                .send({
                    errorMessage: `User '${username}' not found`,
                    ofensorElelement: 'username',
                })
        }

        if (!(await argon2.verify(user.password, currentPassword))) {
            return reply
                .status(403)
                .send({
                    errorMessage: 'Current password is incorrect',
                    ofensorElelement: 'currentPassword',
                })
        }

        user.password = await encryptPassword(newPassword)
        user.updatedAt = new Date().toISOString()

        await knex('users').where({ id: user.id }).update(user)

        return reply.status(201).send({ success: true })
    })
}