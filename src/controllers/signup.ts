import { FastifyInstance } from "fastify";
import { User } from "../models/user.model";
import crypto from 'crypto'

export async function signup (app: FastifyInstance) {

    app.addHook('preHandler', async (request) => {
        console.log(new Date().toISOString(), `[${request.method}] ${request.url}`)
    })

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
    
            reply.cookie('daily_diet_user_key', user.key, {
                httpOnly: true,
                path: '/',
            })

            return reply.status(201).send({ user: user })
        } catch (error) {
            console.error('Error saving user:', error)
            return reply.status(500).send({
                errorMessage: 'Error saving user',
            })
        }
    })
}