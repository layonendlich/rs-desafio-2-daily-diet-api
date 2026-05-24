import { FastifyReply, FastifyRequest } from 'fastify'

export function onlyAdmin (request: FastifyRequest, reply: FastifyReply, done = () => {}) {
    if (!request.currentSession) {
        console.log(new Date().toISOString(), `Unauthorized`)
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    if (!request.currentSession.isAdmin) {
        console.log(new Date().toISOString(), `Forbidden`)
        return reply.status(403).send({ message: 'Forbidden' })
    }

    done()
}