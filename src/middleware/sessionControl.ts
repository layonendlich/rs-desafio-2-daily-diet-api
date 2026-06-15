import { FastifyRequest, FastifyReply } from 'fastify'
import { Session } from '../models/sessions.model'
import { User } from '../models/user.model'

async function getSession (sessionKey: string, userKey: string) {
    const session = new Session()
    await session.getByKey(sessionKey)

    if (!session || session.isFinished) {
        return false
    }

    const user = new User
    await user.getByKey(userKey)

    if (!user || user.inactivated) {
        return false
    }

    return {
        id: session.id,
        key: session.key,
        userId: user.id,
        userKey: user.key,
        userName: user.name,
        isAdmin: false,
    }
}


export async function sessionControl (request: FastifyRequest, reply: FastifyReply, done = () => {}) {
    if (!request.cookies.daily_diet_session || request.cookies.daily_diet_user_key === undefined) {
        return request.currentSession = null
    }

    const session = await getSession(request.cookies.daily_diet_session, request.cookies.daily_diet_user_key)

    request.currentSession = session

    if (session) {
        reply.cookie('daily_diet_session', session.key, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        })
    }

    done()
}