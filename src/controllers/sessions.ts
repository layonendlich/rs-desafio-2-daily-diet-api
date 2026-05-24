import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { onlyAuthenticated } from '../middleware/onlyAuthenticated'
import { onlyAdmin } from '../middleware/onlyAdmin'
import { knex } from '../database'
import { z } from 'zod'
import { Session } from '../models/sessions.model'

export async function sessions (app: FastifyInstance) {

    app.addHook('preHandler', async (request, reply) => {
        console.log(new Date().toISOString(), `[${request.method}] ${request.url}`)
        onlyAuthenticated(request, reply)
    })



    /** READ BY KEY */
    app.get('/:key', async (request: FastifyRequest, reply: FastifyReply) => {
        const { key } = new Session().schema().parse(request.params)

        const conditions = <Object>{ 'sessions.key': key }

        const res = await knex('sessions')
            .where(conditions)
            .leftJoin('users', 'sessions.userId', 'users.id')
            .select('sessions.*', 'users.key as userKey', 'users.name as userName')
        
        const session = new Session()
        await session.getByKey(key)

        if (!session.id) {
            return reply
                .status(404)
                .send({
                    errors: [{
                        errorMessage: `Session '${key}' not found`,
                        ofensorElement: 'key',
                    }]
                })
        }

        if (request.currentSession?.userId !== session.userId && !request.currentSession?.isAdmin) {
            return reply
                .status(403)
                .send({
                    errorMessage: `You are not authorized to view this session's information`,
                    ofensorElement: 'key'
                })
        }
        
        return reply.send({ session })
    })



    /** READ */
    app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        const conditions = <Object>{}

        const query = z.object({
            user: z.coerce.string().nullable().default(null),
            isFinished: z.coerce.number().nullable().default(null)
        }).parse(request.query)

        if (!request.currentSession?.isAdmin) {
            conditions['userId'] = request.currentSession?.userId
        } else {
            if (query.user) {
                conditions['users.key'] = query.user
            }
        }

        if (request.query.isFinished) {
            conditions['sessions.isFinished'] = query.isFinished
        }

        const res = await knex('sessions')
            .where(conditions)
            .leftJoin('users', 'sessions.userId', 'users.id')
            .select('sessions.*', 'users.key as userKey', 'users.name as userName')
        
        return reply.send({ sessions: res })
    })



    /** UPDATE */
    app.patch('/:key', async (request: FastifyRequest, reply: FastifyReply) => {
        const { key } = new Session().schema().parse(request.params)
        const { isFinished } = z.object({
            isFinished: z.coerce.number().nullable().default(null)
        }).parse(request.body)

        const session = new Session()
        await session.getByKey(key)

        if (!session.id) {
            return reply
                .status(404)
                .send({
                    errors: [{
                        errorMessage: `Session '${key}' not found`,
                        ofensorElement: 'key',
                    }]
                })
        }

        if (request.currentSession?.userId !== session.userId && !request.currentSession?.isAdmin) {
            return reply
                .status(403)
                .send({
                    errorMessage: `You are not authorized to update this session's information`,
                    ofensorElement: 'key'
                })
        }

        if (request.body.isFinished) {
            try {
                session.isFinished = isFinished ? true : false
                await session.save()
            } catch (error) {
                return reply
                    .status(500)
                    .send({
                        errors: [{
                            errorMessage: `Failed to update session '${key}'`,
                            ofensorElement: 'key',
                        }]
                    })
            }
        }

        return reply.status(200).send({ session })
    })



    /** DELETE */
    app.delete('/:key', { preHandler: [onlyAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { key } = new Session().schema().parse(request.params)

        const session = new Session()
        await session.getByKey(key)

        if (!session.id) {
            return reply
                .status(404)
                .send({
                    errors: [{
                        errorMessage: `Session '${key}' not found`,
                        ofensorElement: 'key',
                    }]
                })
        }

        // if (request.currentSession?.userId !== session.userId && !request.currentSession?.isAdmin) {
        //     return reply
        //         .status(403)
        //         .send({
        //             errorMessage: `You are not authorized to delete this session`,
        //             ofensorElement: 'key'
        //         })
        // }

        try {
            await session.delete()
            return reply.status(200).send({ message: `Session '${key}' deleted successfully` })
        } catch (error) {
            return reply
                .status(500)
                .send({
                    errors: [{
                        errorMessage: `Failed to delete session '${key}'`,
                        ofensorElement: 'key',
                    }]
                })
        }
    })
}