export function onlyAuthenticated (request: FastifyRequest, reply: FastifyReply, done = () => {}) {
    if (!request.currentSession) {
        console.log(new Date().toISOString(), `Unauthorized`)
        return reply.status(401).send({ message: 'Unauthorized' })
    }
    
    done()
}