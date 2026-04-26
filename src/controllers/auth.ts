import { FastifyInstance } from "fastify";
import { User } from "../models/user.model";
import { env } from "../env";

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
            console.log(new Date().toISOString(), `Login attempt with non-existing key: ${key}`)
            return reply
                .status(401)
                .send({ message: 'Invalid credentials' })
        }

        if (user.blockedTill && user.blockedTill > new Date().toISOString()) {
            console.log(new Date().toISOString(), `Login attempt for blocked user: ${key}, blocked until ${user.blockedTill}`)
            return reply
                .status(401)
                .send({ message: `User is blocked until ${user.blockedTill}` })
        }

        if (user.blocked) {
            console.log(new Date().toISOString(), `Login attempt for blocked user: ${key}`)
            return reply
                .status(401)
                .send({ message: `User is blocked` })
        }

        if (!await user.verifyPassword(password)) {
            console.log(new Date().toISOString(), `Login attempt with invalid password for user: ${key}`)
            user.failedLoginAttempts++

            if (env.MAX_FAILED_LOGIN_ATTEMPTS) {
                console.log(new Date().toISOString(), `User ${key} has ${user.failedLoginAttempts}/${env.MAX_FAILED_LOGIN_ATTEMPTS} failed login attempts`)
            }

            if (env.MAX_FAILED_LOGIN_ATTEMPTS && user.failedLoginAttempts >= env.MAX_FAILED_LOGIN_ATTEMPTS) {
                user.failedLoginAttempts = 0
                
                if (env.BLOCK_DURATION_MINUTES) {
                    console.log(new Date().toISOString(), `User ${key} is blocked for ${env.BLOCK_DURATION_MINUTES} minutes due to too many failed login attempts`)
                    user.blockedTill = new Date(Date.now() + env.BLOCK_DURATION_MINUTES * 60 * 1000).toISOString()
                } else {
                    console.log(new Date().toISOString(), `User ${key} is blocked due to too many failed login attempts`)
                    user.blocked = true
                }
            }

            await user.save()

            return reply
                .status(401)
                .send({ message: 'Invalid credentials' })
        }

        if (user.inactivated) {
            console.log(new Date().toISOString(), `Login attempt for inactivated user: ${key}`)
            return reply
                .status(403)
                .send({ message: 'User account is inactivated' })
        }

        if (user.failedLoginAttempts || user.blockedTill) {
            user.failedLoginAttempts = 0
            user.blocked = false
            user.blockedTill = null
            await user.save()
        }

        console.log(new Date().toISOString(), `User ${key} logged in successfully`)

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