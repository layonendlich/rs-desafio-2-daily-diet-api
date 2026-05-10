import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from 'zod'
import { User, UserInterface } from "../models/user.model";

export async function users (app: FastifyInstance) {

    app.addHook('preHandler', async (request) => {
        console.log(new Date().toISOString(), `[${request.method}] ${request.url}`)
    })

    /** CRETE */
    app.post('/', async (request, reply) => {
        const user = new User()

        const { key, password, name } = user.schema().parse(
            typeof request.body === 'string' ? JSON.parse(request.body) : request.body
        )

        user.key = key
        user.name = name
        await user.setPassword(password)

        try {
            const res = await user.save()

            if (!res) {
                return reply.status(400).send({errors: user.getErrors()})
            }

            return reply.status(201).send({ user: user })
        } catch (error) {
            console.error('Error saving user:', error)
            return reply.status(500).send({
                errorMessage: 'Error saving user',
            })
        }

    })



    /** READ BY ID */
    app.get('/:key', async (request, reply) => {
        const { key } = new User().schema().parse(request.params)

        const user = new User()
        await user.getByKey(key)

        if (!user.id) {
            return reply
                .status(404)
                .send({
                    errors: [{
                        errorMessage: `User '${key}' not found`,
                        ofensorElement: 'key',
                    }]
                })
        }

        return reply.send({ user })
    })



    /** READ */
    app.get('/', async (request, reply) => {
        const res = await knex('users').select('')

        for (const user of res) {
            delete user.password
        }

        return reply.send({ users: res })
    })



    /** UPDATE */
    app.patch('/:key', async (request, reply) => {
        const { key } = new User().schema().parse(request.params)

        const user = new User()
        await user.getByKey(key)

        if (!user.id) {
            return reply
                .status(404)
                .send({
                    errors: [{
                        errorMessage: `User '${key}' not found`,
                        ofensorElement: 'key',
                    }]
                })
        }

        const data = user.schema().partial().parse(
            typeof request.body === 'string' ? JSON.parse(request.body) : request.body
        )

        let modifications = 0
        for (const field of ['key', 'name'] as (keyof UserInterface)[]) {
            if (data[field] && data[field].length && user[field] !== data[field]) {
                user[field] = data[field]
                modifications++
            }
        }

        if (!modifications) {
            console.log('No modifications')
            return reply.send({ user })
        }

        try {
            const res = await user.save()
    
            if (!res) {
                return reply.status(400).send({errors: user.getErrors()})
            }
    
            delete user.password
            delete user.errors
    
            return reply.status(200).send({ user: user })
        } catch (error) {
            console.error('Error saving user:', error)
            return reply.status(500).send({
                errorMessage: 'Error saving user',
            })
        }
    })



    /** DELETE */
    app.delete('/:key', async (request, reply) => {
        const { key } = new User().schema().parse(request.params)

        const user = new User()
        await user.getByKey(key)

        if (!user.id) {
            return reply
                .status(404)
                .send({
                    errors: [{
                        errorMessage: `User '${key}' not found`,
                        ofensorElement: 'key',
                    }]
                })
        }

        try {
            return reply.status(204).send(await user.delete())
        } catch (error) {
            console.error('Error deleting user:', error)
            return reply.status(500).send({
                errorMessage: 'Error deleting user',
            })
        }
    })



    /** PASSWORD CHANGE */
    app.post('/:key/password', async (request, reply) => {
        const { key } = request.params as { key: string }
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
                    ofensorElement: 'currentPassword',
                })
        }

        if (!newPassword.length) {
            return reply
                .status(400)
                .send({
                    errorMessage: 'New password is required',
                    ofensorElement: 'newPassword',
                })
        }

        const user = new User()
        await user.getByKey(key)

        if (!user) {
            return reply
                .status(404)
                .send({
                    errorMessage: `User '${key}' not found`,
                    ofensorElement: 'key',
                })
        }

        if (!(await user.verifyPassword(currentPassword))) {
            return reply
                .status(403)
                .send({
                    errorMessage: 'Current password is incorrect',
                    ofensorElement: 'currentPassword',
                })
        }

        try {
            await user.setPassword(newPassword)
            await user.save()
        } catch (error) {
            return reply
                .status(400)
                .send({
                    errorMessage: error.errorMessage || 'Error changing password',
                    ofensorElement: 'newPassword',
                })
        }

        return reply.status(200).send({ success: true, user })
    })


    /** USERS'S SESSIONS */
    app.get('/:key/sessions', async (request, reply) => {
        const { key } = new User().schema().parse(request.params)
        const user = new User()
        await user.getByKey(key)

        const res = await knex('sessions')
            .where({ userId: user.id})

        return reply.send({ sessions: res })
    })
}