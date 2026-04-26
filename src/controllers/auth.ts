import { FastifyInstance } from "fastify";
import { User } from "../models/user.model";

export async function auth (app: FastifyInstance) {

    app.addHook('preHandler', async (request) => {
        console.log(new Date().toISOString(), `[${request.method}] ${request.url}`)
    })

    app.post('/login', async (request, reply) => {
        const { key, password } = request.body as { key: string, password: string }

        if (!key || !key.length) {
            return reply.status(400).send({
                errors: [{
                    errorMessage: 'Key is required',
                    ofensorElement: 'key',
                }]
            })
        }

        if (!password || !password.length) {
            return reply.status(400).send({
                errors: [{
                    errorMessage: 'Password is required',
                    ofensorElement: 'password',
                }]
            })
        }

        const user = new User()
        await user.getByKey(key)

        if (!user.id) {
            return reply
                .status(401)
                .send({ message: 'Invalid credentials' })
        }

        if (!await user.verifyPassword(password)) {
            return reply
                .status(401)
                .send({ message: 'Invalid credentials' })
        }

        reply.cookie('daily_diet_user_key', user.key, {
            httpOnly: true,
            path: '/',
        })

        return reply.status(200).send({ user: user })
    })

    app.get('/logout', async (request, reply) => {
        reply.clearCookie('daily_diet_user_key', {
            httpOnly: true, 
            path: '/',
        })
        return reply.status(200).send({ message: 'Logged out successfully' })
    })
}